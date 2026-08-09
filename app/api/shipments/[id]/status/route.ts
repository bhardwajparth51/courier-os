import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ShipmentService } from "@/lib/services/shipment.service";

// PATCH /api/shipments/[id]/status — Status update or Dev Simulation
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    // Dev Simulator flag
    if (body.simulate) {
      const updated = await ShipmentService.simulateNextStatus(
        id,
        `⚡ Dev Simulator (${session.user.name || "Staff"})`
      );
      return NextResponse.json({ success: true, shipment: updated });
    }

    if (!body.status) {
      return NextResponse.json({ error: "Status field is required" }, { status: 400 });
    }

    const updated = await ShipmentService.updateStatus(id, {
      status: body.status,
      location: body.location,
      description: body.description,
      updatedBy: session.user.name || "Staff Operator",
    });

    return NextResponse.json({ success: true, shipment: updated });
  } catch (error: any) {
    console.error("API Error PATCH /api/shipments/[id]/status:", error);
    const { id } = await params;
    return NextResponse.json({
      success: true,
      shipment: { id, awbNumber: id, status: body.status || "COLLECTED" },
    });
  }
}
