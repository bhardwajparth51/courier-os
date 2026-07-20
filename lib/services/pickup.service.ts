import { prisma } from "@/lib/prisma";
import { PickupStatus } from "@prisma/client";

export class PickupService {
  // 1. Generate Pickup Number
  static generatePickupNumber(): string {
    const random = Math.floor(100000 + Math.random() * 900000);
    return `PKP${random}`;
  }

  // 2. Create Pickup Request
  static async createPickupRequest(data: {
    senderName: string;
    senderPhone: string;
    address: string;
    city: string;
    pincode: string;
    scheduledDate?: string | Date;
    preferredTime?: string;
    customerId?: string;
    remarks?: string;
  }) {
    const pickupNumber = this.generatePickupNumber();
    const scheduledDate = data.scheduledDate ? new Date(data.scheduledDate) : new Date();

    const pickup = await prisma.pickupRequest.create({
      data: {
        pickupNumber,
        customerId: data.customerId,
        senderName: data.senderName,
        senderPhone: data.senderPhone,
        address: data.address,
        city: data.city,
        pincode: data.pincode,
        scheduledDate,
        preferredTime: data.preferredTime || "Morning (10 AM - 1 PM)",
        status: "PENDING",
        remarks: data.remarks,
      },
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        action: "PICKUP_REQUESTED",
        entity: "PickupRequest",
        entityId: pickup.id,
        performedBy: data.senderName,
        metadata: JSON.stringify({ pickupNumber, city: pickup.city, phone: pickup.senderPhone }),
      },
    });

    return pickup;
  }

  // 3. Assign Staff Member to Pickup
  static async assignEmployee(pickupId: string, employeeId: string, assignedBy = "Manager") {
    const pickup = await prisma.pickupRequest.update({
      where: { id: pickupId },
      data: {
        assignedEmployeeId: employeeId,
        status: "ASSIGNED",
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "PICKUP_ASSIGNED",
        entity: "PickupRequest",
        entityId: pickupId,
        performedBy: assignedBy,
        metadata: JSON.stringify({ pickupNumber: pickup.pickupNumber, assignedEmployeeId: employeeId }),
      },
    });

    return pickup;
  }

  // 4. Record Pickup Completion / Attempt
  static async completePickup(pickupId: string, params: { status: "COMPLETED" | "CANCELLED" | "SENDER_UNAVAILABLE"; remarks?: string; employeeName?: string }) {
    const result = await prisma.$transaction(async (tx) => {
      const p = await tx.pickupRequest.update({
        where: { id: pickupId },
        data: {
          status: params.status === "COMPLETED" ? "COMPLETED" : params.status === "CANCELLED" ? "CANCELLED" : "PENDING",
          remarks: params.remarks,
        },
      });

      const attempt = await tx.pickupAttempt.create({
        data: {
          pickupId,
          status: params.status,
          remarks: params.remarks,
        },
      });

      await tx.activityLog.create({
        data: {
          action: `PICKUP_${params.status}`,
          entity: "PickupRequest",
          entityId: pickupId,
          performedBy: params.employeeName || "Pickup Staff",
          metadata: JSON.stringify({ pickupNumber: p.pickupNumber, status: params.status }),
        },
      });

      return { pickup: p, attempt };
    });

    return result;
  }
}
