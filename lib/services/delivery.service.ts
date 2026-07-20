import { prisma } from "@/lib/prisma";

export class DeliveryService {
  // 1. Generate Run Number
  static generateRunNumber(): string {
    const random = Math.floor(1000 + Math.random() * 9000);
    return `RUN-2026-${random}`;
  }

  // 2. Create Delivery Run
  static async createDeliveryRun(data: {
    employeeId?: string;
    vehicleNumber?: string;
    shipmentIds: string[];
  }) {
    const runNumber = this.generateRunNumber();

    const result = await prisma.$transaction(async (tx) => {
      const run = await tx.deliveryRun.create({
        data: {
          runNumber,
          employeeId: data.employeeId,
          vehicleNumber: data.vehicleNumber || "Franchise E-Bike",
          status: "IN_PROGRESS",
          startedAt: new Date(),
        },
      });

      // Link shipments
      for (let i = 0; i < data.shipmentIds.length; i++) {
        const sId = data.shipmentIds[i];
        const sRecord = await tx.shipment.findFirst({
          where: { OR: [{ id: sId }, { awbNumber: sId }] },
        });
        const awbNumber = sRecord ? sRecord.awbNumber : sId;
        const realId = sRecord ? sRecord.id : sId;

        await tx.runShipment.create({
          data: {
            runId: run.id,
            shipmentId: awbNumber,
            sequenceOrder: i + 1,
            status: "PENDING",
          },
        });

        // Update shipment status to OUT_FOR_DELIVERY
        await tx.shipment.update({
          where: { id: realId },
          data: { status: "OUT_FOR_DELIVERY" },
        });

        await tx.trackingEvent.create({
          data: {
            shipmentId: realId,
            status: "OUT_FOR_DELIVERY",
            location: "Destination Local Area",
            description: `Out for delivery with delivery agent. Run #${runNumber}`,
            updatedBy: "Delivery System",
          },
        });
      }

      await tx.activityLog.create({
        data: {
          action: "DELIVERY_RUN_CREATED",
          entity: "DeliveryRun",
          entityId: run.id,
          performedBy: "Delivery Executive",
          metadata: JSON.stringify({ runNumber, shipmentCount: data.shipmentIds.length }),
        },
      });

      return run;
    });

    return result;
  }

  // 3. Submit Proof of Delivery (POD)
  static async submitPOD(params: {
    shipmentId: string;
    receiverName: string;
    otpCode?: string;
    otpVerified?: boolean;
    signatureUrl?: string;
    performedBy?: string;
  }) {
    // Resolve real shipment by CUID id or AWB number
    const sRecord = await prisma.shipment.findFirst({
      where: { OR: [{ id: params.shipmentId }, { awbNumber: params.shipmentId }] },
    });
    if (!sRecord) throw new Error(`Shipment "${params.shipmentId}" not found`);
    const realId = sRecord.id;

    const result = await prisma.$transaction(async (tx) => {
      const pod = await tx.proofOfDelivery.upsert({
        where: { shipmentId: realId },
        update: {
          receiverName: params.receiverName,
          otpCode: params.otpCode,
          otpVerified: params.otpVerified ?? true,
          signatureUrl: params.signatureUrl,
        },
        create: {
          shipmentId: realId,
          receiverName: params.receiverName,
          otpCode: params.otpCode,
          otpVerified: params.otpVerified ?? true,
          signatureUrl: params.signatureUrl,
        },
      });

      // Update Shipment Status to DELIVERED
      const shipment = await tx.shipment.update({
        where: { id: realId },
        data: { status: "DELIVERED" },
      });

      // Mark Payment as COLLECTED if COD
      await tx.payment.updateMany({
        where: { shipmentId: realId },
        data: { status: "COLLECTED", collectedAt: new Date() },
      });

      // Add Tracking Event
      await tx.trackingEvent.create({
        data: {
          shipmentId: realId,
          status: "DELIVERED",
          location: `${shipment.receiverCity || "Destination"} Receiver Address`,
          description: `Handed over to ${params.receiverName}. Signed & OTP verified.`,
          updatedBy: params.performedBy || "Delivery Staff",
        },
      });

      // Update RunShipment status
      await tx.runShipment.updateMany({
        where: { shipmentId: sRecord.awbNumber },
        data: { status: "DELIVERED" },
      });

      // Audit Log
      await tx.activityLog.create({
        data: {
          action: "DELIVERY_POD_RECORDED",
          entity: "Shipment",
          entityId: realId,
          performedBy: params.performedBy || "Delivery Staff",
          metadata: JSON.stringify({ awbNumber: shipment.awbNumber, receiver: params.receiverName }),
        },
      });

      return { pod, shipment };
    });

    return result;
  }


  // 4. Record Failed Delivery Attempt (Retry vs RTO)
  static async recordFailedDelivery(params: {
    shipmentId: string;
    reason: string;
    action: "RETRY_TOMORROW" | "RETURN_TO_ORIGIN";
    remarks?: string;
    performedBy?: string;
  }) {
    const result = await prisma.$transaction(async (tx) => {
      const failed = await tx.failedDeliveryAttempt.create({
        data: {
          shipmentId: params.shipmentId,
          reason: params.reason,
          action: params.action,
          remarks: params.remarks,
        },
      });

      const nextStatus = params.action === "RETURN_TO_ORIGIN" ? "RTO" : "AWAITING_PICKUP";

      const shipment = await tx.shipment.update({
        where: { id: params.shipmentId },
        data: { status: nextStatus },
      });

      await tx.trackingEvent.create({
        data: {
          shipmentId: params.shipmentId,
          status: nextStatus,
          location: "Local Delivery Hub",
          description: `Delivery attempt failed: ${params.reason}. Action: ${params.action}. ${params.remarks ?? ""}`,
          updatedBy: params.performedBy || "Delivery Executive",
        },
      });

      await tx.runShipment.updateMany({
        where: { shipmentId: params.shipmentId },
        data: { status: "FAILED" },
      });

      await tx.activityLog.create({
        data: {
          action: `DELIVERY_FAILED_${params.action}`,
          entity: "Shipment",
          entityId: params.shipmentId,
          performedBy: params.performedBy || "Delivery Executive",
          metadata: JSON.stringify({ awbNumber: shipment.awbNumber, reason: params.reason, action: params.action }),
        },
      });

      return failed;
    });

    return result;
  }
}
