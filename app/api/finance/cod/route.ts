import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FinanceService } from "@/lib/services/finance.service";
import { ShipmentService } from "@/lib/services/shipment.service";

// GET /api/finance/cod — Get all COD settlements and driver holdings
export async function GET() {
  try {
    const session = await auth();
    let settlements = await prisma.cODSettlement.findMany({ orderBy: { shipmentId: "asc" } });

    // Auto-seed from existing shipments if no settlements exist
    if (settlements.length === 0) {
      const codShipments = await prisma.shipment.findMany({
        where: { OR: [{ paymentMethod: "COD" }, { codAmount: { gt: 0 } }] },
      });

      if (codShipments.length > 0) {
        await Promise.all(
          codShipments.map((s) =>
            prisma.cODSettlement.upsert({
              where: { shipmentId: s.awbNumber },
              update: {},
              create: {
                shipmentId: s.awbNumber,
                amount: s.codAmount || s.totalAmount,
                status: "COLLECTED",
              },
            })
          )
        );
        settlements = await prisma.cODSettlement.findMany({ orderBy: { shipmentId: "asc" } });
      } else {
        // Create 2 mock COD settlements for quick testing
        await Promise.all([
          prisma.cODSettlement.upsert({
            where: { shipmentId: "AWB-928172" },
            update: {},
            create: {
              shipmentId: "AWB-928172",
              amount: 2500,
              status: "COLLECTED",
              driverId: "drv_rahul",
            },
          }),
          prisma.cODSettlement.upsert({
            where: { shipmentId: "AWB-881273" },
            update: {},
            create: {
              shipmentId: "AWB-881273",
              amount: 4800,
              status: "DRIVER_HOLDING",
              driverId: "drv_amit",
            },
          }),
        ]);
        settlements = await prisma.cODSettlement.findMany({ orderBy: { shipmentId: "asc" } });
      }
    }

    return NextResponse.json({ settlements });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/finance/cod — Update COD settlement status along the driver -> branch -> settled line
export async function PATCH(req: Request) {
  try {
    const session = await auth();
    const { shipmentId, status, driverId } = await req.json();
    if (!shipmentId || !status) {
      return NextResponse.json({ error: "Shipment AWB and target status required" }, { status: 400 });
    }

    const updated = await FinanceService.updateCODSettlementStatus(
      shipmentId,
      status,
      driverId,
      session?.user?.name || "Demo Reconciler"
    );

    return NextResponse.json({ settlement: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// POST /api/finance/cod — Simulate and insert a new COD shipment with settlement record
export async function POST(req: Request) {
  try {
    const session = await auth();
    const mockCODAmount = Math.floor(1500 + Math.random() * 7000);
    const awbNum = `DTDC${Math.floor(100000000 + Math.random() * 900000000)}`;

    // Create a real COD shipment using core ShipmentService
    const result = await ShipmentService.createShipment({
      senderName: "Nisha Enterprises",
      senderPhone: "9870912831",
      senderAddress: "F-120, MIDC Industrial Area",
      senderCity: "Pune",
      senderState: "Maharashtra",
      senderPincode: "411018",
      receiverName: `Receiver Client ${Math.floor(100 + Math.random() * 900)}`,
      receiverPhone: "8899881122",
      receiverAddress: "Flat 4B, Sky Towers, MG Road",
      receiverCity: "Delhi",
      receiverState: "Delhi",
      receiverPincode: "110001",
      parcelType: "PARCEL",
      weight: 2.0,
      serviceType: "EXPRESS",
      paymentMethod: "COD",
      codAmount: mockCODAmount,
      performedBy: session?.user?.name || "Demo Simulator",
    });

    // Make sure it exists in the CODSettlement table
    const settlement = await prisma.cODSettlement.findUnique({
      where: { shipmentId: result.shipment.awbNumber },
    });

    return NextResponse.json({ shipment: result.shipment, settlement }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
