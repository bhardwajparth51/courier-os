import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/tracking/[awb] — Public tracking route
export async function GET(
  req: Request,
  { params }: { params: Promise<{ awb: string }> }
) {
  try {
    const { awb } = await params;

    const shipment = await prisma.shipment.findFirst({
      where: {
        OR: [
          { awbNumber: { equals: awb, mode: "insensitive" } },
          { id: awb },
        ],
      },
      select: {
        awbNumber: true,
        status: true,
        serviceType: true,
        parcelType: true,
        weight: true,
        senderCity: true,
        receiverName: true,
        receiverCity: true,
        receiverState: true,
        expectedDelivery: true,
        createdAt: true,
        branch: { select: { name: true, city: true, phone: true } },
        trackingEvents: {
          orderBy: { timestamp: "asc" },
          select: {
            id: true,
            status: true,
            location: true,
            description: true,
            timestamp: true,
            updatedBy: true,
          },
        },
      },
    });

    if (!shipment) {
      return NextResponse.json({ error: "Shipment not found with AWB: " + awb }, { status: 404 });
    }

    return NextResponse.json({ shipment });
  } catch (error: any) {
    console.error("API Error GET /api/tracking/[awb]:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch tracking details" }, { status: 500 });
  }
}
