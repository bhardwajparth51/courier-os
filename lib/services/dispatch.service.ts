import { prisma } from "@/lib/prisma";

export class DispatchService {
  // 1. Generate Bag Number & Manifest Number
  static generateBagNumber(): string {
    const random = Math.floor(10000 + Math.random() * 90000);
    return `DTDCBAG${random}`;
  }

  static generateManifestNumber(): string {
    const random = Math.floor(1000 + Math.random() * 9000);
    return `MNF-2026-${random}`;
  }

  // 2. Create Courier Bag
  static async createCourierBag(data: {
    originHub: string;
    destinationHub: string;
    vehicleNumber?: string;
    handledBy?: string;
  }) {
    const bagNumber = this.generateBagNumber();

    const bag = await prisma.courierBag.create({
      data: {
        bagNumber,
        originHub: data.originHub,
        destinationHub: data.destinationHub,
        vehicleNumber: data.vehicleNumber,
        handledBy: data.handledBy || "Branch Operator",
        status: "OPEN",
        isLocked: false,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "BAG_CREATED",
        entity: "CourierBag",
        entityId: bag.id,
        performedBy: data.handledBy || "Branch Operator",
        metadata: JSON.stringify({ bagNumber, destination: data.destinationHub }),
      },
    });

    return bag;
  }

  // 3. Scan AWB into Bag (Enforces isLocked check)
  static async addShipmentToBag(bagId: string, awbNumber: string) {
    const bag = await prisma.courierBag.findUnique({ where: { id: bagId } });
    if (!bag) throw new Error("Courier Bag not found.");
    if (bag.isLocked || bag.status === "SEALED" || bag.status === "DISPATCHED") {
      throw new Error("Bag is SEALED and locked. No further AWBs can be added.");
    }

    const shipment = await prisma.shipment.findUnique({ where: { awbNumber } });
    if (!shipment) throw new Error(`Shipment with AWB ${awbNumber} not found.`);

    // Check if already in bag
    const existing = await prisma.bagShipment.findFirst({
      where: { bagId, shipmentId: shipment.id },
    });
    if (existing) throw new Error(`AWB ${awbNumber} is already scanned into this bag.`);

    const bagShipment = await prisma.bagShipment.create({
      data: { bagId, shipmentId: shipment.awbNumber },
    });

    return { bagShipment, shipment };
  }

  // 4. Seal & Lock Bag + Generate Immutable Manifest
  static async sealAndLockBag(bagId: string, sealNumber: string, handledBy = "Staff Operator") {
    const bag = await prisma.courierBag.findUnique({
      where: { id: bagId },
      include: { bagShipments: true },
    });
    if (!bag) throw new Error("Bag not found.");
    if (bag.isLocked) throw new Error("Bag is already sealed and locked.");

    // Fetch all shipments in bag to calculate weight & freight
    const shipmentIds = bag.bagShipments.map((bs) => bs.shipmentId);
    const shipments = await prisma.shipment.findMany({
      where: { id: { in: shipmentIds } },
    });

    const totalWeight = shipments.reduce((sum, s) => sum + s.weight, 0);
    const manifestNumber = this.generateManifestNumber();

    const result = await prisma.$transaction(async (tx) => {
      // Update Bag to SEALED and lock it
      const updatedBag = await tx.courierBag.update({
        where: { id: bagId },
        data: {
          sealNumber,
          status: "SEALED",
          isLocked: true,
        },
      });

      // Create Immutable Manifest
      const manifest = await tx.dispatchManifest.create({
        data: {
          manifestNumber,
          bagId,
          destinationHub: bag.destinationHub,
          totalShipments: shipments.length,
          totalWeight,
          handledBy,
        },
      });

      // Update status of all shipments inside bag to DISPATCHED / SORTING_CENTER
      for (const s of shipments) {
        await tx.shipment.update({
          where: { id: s.id },
          data: { status: "SORTING_CENTER" },
        });

        await tx.trackingEvent.create({
          data: {
            shipmentId: s.id,
            status: "SORTING_CENTER",
            location: `Courier Bag ${bag.bagNumber} (Seal: ${sealNumber})`,
            description: `Sealed in bag for ${bag.destinationHub} hub dispatch.`,
            updatedBy: handledBy,
          },
        });
      }

      // Audit Log
      await tx.activityLog.create({
        data: {
          action: "BAG_SEALED_&_MANIFEST_GENERATED",
          entity: "CourierBag",
          entityId: bagId,
          performedBy: handledBy,
          metadata: JSON.stringify({
            bagNumber: bag.bagNumber,
            sealNumber,
            manifestNumber,
            shipmentCount: shipments.length,
            totalWeight,
          }),
        },
      });

      return { bag: updatedBag, manifest };
    });

    return result;
  }
}
