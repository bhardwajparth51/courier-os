import { prisma } from "@/lib/prisma";
import { ShipmentStatus, ServiceType, ParcelType, PaymentMethod, PaymentStatus } from "@prisma/client";
import { calculateShipmentPrice } from "@/lib/pricing";
import { notifyShipmentBooked } from "./notification.service";


// 10 Operational Journey Stages in sequence
export const JOURNEY_STAGES: ShipmentStatus[] = [
  "BOOKED",
  "AWAITING_PICKUP",
  "COLLECTED",
  "ORIGIN_HUB",
  "REGIONAL_HUB",
  "SORTING_CENTER",
  "DESTINATION_HUB",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

const STAGE_LABELS: Record<ShipmentStatus, { location: string; description: string }> = {
  BOOKED:           { location: "DTDC Pankaj Agencies, Pune", description: "Shipment booked & AWB generated." },
  AWAITING_PICKUP:  { location: "Sender Address",             description: "Pickup scheduled for pickup agent." },
  COLLECTED:        { location: "Pune Franchise Hub",         description: "Parcel collected & scanned at franchise branch." },
  ORIGIN_HUB:       { location: "Pune Central Hub",           description: "Arrived at origin processing hub." },
  REGIONAL_HUB:     { location: "Maharashtra Gateway Hub",    description: "In transit through regional transit hub." },
  SORTING_CENTER:   { location: "Central Sorting Hub",        description: "Package sorted & dispatched to destination sector." },
  DESTINATION_HUB:  { location: "Destination City Hub",       description: "Arrived at local destination hub." },
  OUT_FOR_DELIVERY: { location: "Destination Local Area",     description: "Out for delivery with delivery executive." },
  DELIVERED:        { location: "Receiver Address",           description: "Delivered to receiver & proof of delivery signed." },
  CANCELLED:        { location: "Franchise Hub",              description: "Shipment cancelled." },
  RTO:              { location: "Return Processing Hub",      description: "Shipment returned to origin." },
};

export class ShipmentService {

  // 1. Generate AWB Number
  static generateAWB(): string {
    const randomDigits = Math.floor(100000000 + Math.random() * 900000000).toString();
    return `DTDC${randomDigits}`;
  }

  // 2. Calculate ETA Date
  static calculateETA(serviceType: ServiceType, fromDate = new Date()): Date {
    const eta = new Date(fromDate);
    let daysToAdd = 3;
    switch (serviceType) {
      case "EXPRESS": daysToAdd = 1; break;
      case "STANDARD": daysToAdd = 3; break;
      case "SURFACE": daysToAdd = 5; break;
      case "INTERNATIONAL": daysToAdd = 10; break;
    }
    eta.setDate(eta.getDate() + daysToAdd);
    return eta;
  }

  // 3. Create Shipment Workflow
  static async createShipment(data: {
    senderName: string;
    senderPhone: string;
    senderAddress: string;
    senderCity: string;
    senderState: string;
    senderPincode: string;
    receiverName: string;
    receiverPhone: string;
    receiverAddress: string;
    receiverCity: string;
    receiverState: string;
    receiverPincode: string;
    parcelType: ParcelType;
    weight: number;
    length?: number;
    width?: number;
    height?: number;
    declaredValue?: number;
    hasInsurance?: boolean;
    serviceType: ServiceType;
    paymentMethod: PaymentMethod;
    codAmount?: number;
    performedBy?: string;
  }) {
    const awbNumber = this.generateAWB();
    const expectedDelivery = this.calculateETA(data.serviceType);

    // Calculate Price
    const pricing = calculateShipmentPrice({
      weight: data.weight,
      length: data.length,
      width: data.width,
      height: data.height,
      parcelType: data.parcelType,
      serviceType: data.serviceType,
      hasInsurance: data.hasInsurance,
      declaredValue: data.declaredValue,
      paymentMethod: data.paymentMethod,
      codAmount: data.codAmount,
    });

    // Find default branch or auto-create main branch if none exists
    let branch = await prisma.branch.findFirst();
    if (!branch) {
      branch = await prisma.branch.create({
        data: {
          name: "DTDC Main Branch - Pune",
          address: "Shop #12, Commercial Complex, FC Road",
          city: "Pune",
          state: "Maharashtra",
          pincode: "411004",
          phone: "020-25678900",
          email: "pune.branch@dtdc.demo",
        },
      });
    }


    // Customer lookup or creation
    let customer = await prisma.customer.findFirst({
      where: { phone: data.senderPhone },
    });

    if (!customer) {
      // Create guest customer user account
      const guestUser = await prisma.user.create({
        data: {
          name: data.senderName,
          email: `${data.senderPhone}@dtdc.demo`,
          phone: data.senderPhone,
          role: "CUSTOMER",
        },
      });
      customer = await prisma.customer.create({
        data: {
          userId: guestUser.id,
          phone: data.senderPhone,
          address: data.senderAddress,
          city: data.senderCity,
          state: data.senderState,
          pincode: data.senderPincode,
        },
      });
    }

    // Execute atomic creation transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create Shipment
      const shipment = await tx.shipment.create({
        data: {
          awbNumber,
          branchId: branch.id,
          customerId: customer.id,
          senderName: data.senderName,
          senderPhone: data.senderPhone,
          senderAddress: data.senderAddress,
          senderCity: data.senderCity,
          senderState: data.senderState,
          senderPincode: data.senderPincode,
          receiverName: data.receiverName,
          receiverPhone: data.receiverPhone,
          receiverAddress: data.receiverAddress,
          receiverCity: data.receiverCity,
          receiverState: data.receiverState,
          receiverPincode: data.receiverPincode,
          parcelType: data.parcelType,
          weight: data.weight,
          length: data.length,
          width: data.width,
          height: data.height,
          declaredValue: data.declaredValue || 0,
          hasInsurance: data.hasInsurance || false,
          insuranceAmount: pricing.insuranceCharge,
          serviceType: data.serviceType,
          status: "BOOKED",
          freightCharge: pricing.baseCharge + pricing.weightCharge + pricing.distanceCharge,
          fuelSurcharge: Math.round(pricing.subtotal * 0.05),
          insuranceCharge: pricing.insuranceCharge,
          codAmount: data.codAmount || 0,
          totalAmount: pricing.total,
          paymentMethod: data.paymentMethod,
          expectedDelivery,
        },
      });

      // Create initial Tracking Event
      const trackingEvent = await tx.trackingEvent.create({
        data: {
          shipmentId: shipment.id,
          status: "BOOKED",
          location: `${branch.name}, ${branch.city}`,
          description: STAGE_LABELS.BOOKED.description,
          updatedBy: data.performedBy || "Staff Operator",
        },
      });

      // Create Payment Record
      const payment = await tx.payment.create({
        data: {
          shipmentId: shipment.id,
          method: data.paymentMethod,
          amount: pricing.total,
          codAmount: data.codAmount || 0,
          status: data.paymentMethod === "COD" ? "PENDING" : "COLLECTED",
          collectedAt: data.paymentMethod === "COD" ? null : new Date(),
        },
      });

      // Create COD Settlement entry if method is COD
      if (data.paymentMethod === "COD") {
        await tx.cODSettlement.create({
          data: {
            shipmentId: shipment.awbNumber,
            amount: data.codAmount || pricing.total,
            status: "COLLECTED",
          },
        });
      }

      // Create GST Tax Invoice
      const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const invoice = await tx.invoice.create({
        data: {
          shipmentId: shipment.id,
          invoiceNumber,
          amount: pricing.subtotal,
          tax: pricing.tax,
          total: pricing.total,
        },
      });

      // Create Audit Log
      await tx.activityLog.create({
        data: {
          action: "SHIPMENT_CREATED",
          entity: "Shipment",
          entityId: shipment.id,
          performedBy: data.performedBy || "Staff Operator",
          metadata: JSON.stringify({
            awbNumber: shipment.awbNumber,
            serviceType: shipment.serviceType,
            totalAmount: shipment.totalAmount,
            sender: shipment.senderName,
            receiver: shipment.receiverName,
          }),
        },
      });

      return { shipment, trackingEvent, payment, invoice };
    });

    // Dispatch notification asynchronously
    notifyShipmentBooked({
      phone: data.senderPhone,
      awb: result.shipment.awbNumber,
      sender: result.shipment.senderName,
      receiver: result.shipment.receiverName,
      amount: String(result.shipment.totalAmount),
    }).catch(err => console.error("[notifyShipmentBooked trigger error]", err));

    return result;
  }


  // 4. Update Status Workflow (Supports CUID id OR awbNumber)
  static async updateStatus(
    shipmentId: string,
    params: {
      status: ShipmentStatus;
      location?: string;
      description?: string;
      updatedBy?: string;
    }
  ) {
    const shipment = await prisma.shipment.findFirst({
      where: { OR: [{ id: shipmentId }, { awbNumber: shipmentId }] },
    });
    if (!shipment) throw new Error(`Shipment ${shipmentId} not found.`);

    const targetId = shipment.id;
    const oldStatus = shipment.status;
    const stageInfo = STAGE_LABELS[params.status] ?? { location: "Transit Hub", description: "Status updated." };
    const location = params.location || stageInfo.location;
    const description = params.description || stageInfo.description;
    const updatedBy = params.updatedBy || "Staff Operator";

    const updatedShipment = await prisma.$transaction(async (tx) => {
      const s = await tx.shipment.update({
        where: { id: targetId },
        data: { status: params.status },
      });

      await tx.trackingEvent.create({
        data: {
          shipmentId: targetId,
          status: params.status,
          location,
          description,
          updatedBy,
        },
      });

      // Update payment if delivered COD
      if (params.status === "DELIVERED" && shipment.paymentMethod === "COD") {
        await tx.payment.updateMany({
          where: { shipmentId: targetId },
          data: { status: "COLLECTED", collectedAt: new Date() },
        });
      }

      // Log Activity
      await tx.activityLog.create({
        data: {
          action: "STATUS_UPDATED",
          entity: "Shipment",
          entityId: targetId,
          performedBy: updatedBy,
          metadata: JSON.stringify({
            awbNumber: shipment.awbNumber,
            oldStatus,
            newStatus: params.status,
            location,
          }),
        },
      });

      return s;
    });

    return updatedShipment;
  }

  // 5. Dev Simulator: Fast-forward status to next stage
  static async simulateNextStatus(shipmentId: string, updatedBy = "Dev Simulator") {
    const shipment = await prisma.shipment.findFirst({
      where: { OR: [{ id: shipmentId }, { awbNumber: shipmentId }] },
    });
    if (!shipment) throw new Error(`Shipment ${shipmentId} not found.`);

    const currentIndex = JOURNEY_STAGES.indexOf(shipment.status);
    if (currentIndex === -1 || currentIndex >= JOURNEY_STAGES.length - 1) {
      // Already delivered or cancelled
      return shipment;
    }

    const nextStatus = JOURNEY_STAGES[currentIndex + 1];
    return this.updateStatus(shipment.id, {
      status: nextStatus,
      updatedBy,
    });
  }

  // 6. Cancel Shipment Workflow (Soft Cancel)
  static async cancelShipment(shipmentId: string, reason = "Cancelled by user", performedBy = "Staff") {
    return this.updateStatus(shipmentId, {
      status: "CANCELLED",
      description: `Shipment cancelled. Reason: ${reason}`,
      updatedBy: performedBy,
    });
  }
}
