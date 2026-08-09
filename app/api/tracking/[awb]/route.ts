import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import { getDemoShipmentDetail } from "@/lib/demoData";

// GET /api/tracking/[awb] — Public tracking route
export async function GET(
  req: Request,
  { params }: { params: Promise<{ awb: string }> }
) {
  const { awb } = await params;
  try {
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
      return NextResponse.json({ shipment: getDemoShipmentDetail(awb) });
    }

    return NextResponse.json({ shipment });
  } catch (error: any) {
    console.error("API Error GET /api/tracking/[awb]:", error);
    return NextResponse.json({ shipment: getDemoShipmentDetail(awb) });
  }
}
