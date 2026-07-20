import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { DeliveryService } from "@/lib/services/delivery.service";

// POST /api/deliveries/[id]/failed — Record failed delivery attempt (Retry vs RTO)
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();

    const failed = await DeliveryService.recordFailedDelivery({
      shipmentId: id,
      reason: body.reason,
      action: body.action || "RETRY_TOMORROW",
      remarks: body.remarks,
      performedBy: session.user.name || "Delivery Executive",
    });

    return NextResponse.json({ success: true, failed });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
