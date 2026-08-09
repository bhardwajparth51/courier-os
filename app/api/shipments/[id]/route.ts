import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ShipmentService } from "@/lib/services/shipment.service";
import { getDemoShipmentDetail } from "@/lib/demoData";

// GET /api/shipments/[id] — Fetch full shipment graph
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const shipment = await prisma.shipment.findFirst({
      where: {
        OR: [{ id }, { awbNumber: id }],
      },
      include: {
        branch: {
          include: { settings: true },
        },
        customer: {
          include: { user: { select: { name: true, email: true, phone: true } } },
        },
        handledBy: {
          include: { user: { select: { name: true } } },
        },
        trackingEvents: {
          orderBy: { timestamp: "asc" },
        },
        payment: true,
        invoice: true,
      },
    });

    if (!shipment) {
      return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
    }

    // Fetch related Activity Logs for audit tab
    const activityLogs = await prisma.activityLog.findMany({
      where: { entity: "Shipment", entityId: shipment.id },
      orderBy: { performedAt: "desc" },
    });

    return NextResponse.json({ shipment, activityLogs });
  } catch (error: any) {
    console.error("API Error GET /api/shipments/[id]:", error);
    const { id } = await params;
    return NextResponse.json({ shipment: getDemoShipmentDetail(id), activityLogs: [] });
  }
}

// DELETE /api/shipments/[id] — Soft Cancel Shipment
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const cancelled = await ShipmentService.cancelShipment(
      id,
      "Cancelled by user via API",
      session.user.name || "Operator"
    );

    return NextResponse.json({ success: true, shipment: cancelled });
  } catch (error: any) {
    console.error("API Error DELETE /api/shipments/[id]:", error);
    return NextResponse.json({ error: error.message || "Failed to cancel shipment" }, { status: 400 });
  }
}
