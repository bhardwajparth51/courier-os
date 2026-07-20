import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { DeliveryService } from "@/lib/services/delivery.service";
import { notifyDelivered } from "@/lib/services/notification.service";

// POST /api/deliveries/[id]/pod — Submit Proof of Delivery
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();

    const result = await DeliveryService.submitPOD({
      shipmentId: id,
      receiverName: body.receiverName,
      otpCode: body.otpCode,
      otpVerified: body.otpVerified ?? true,
      signatureUrl: body.signatureUrl,
      performedBy: session.user.name || "Delivery Staff",
    });

    // Asynchronously dispatch delivery notification
    if (result?.shipment) {
      notifyDelivered({
        phone: result.shipment.senderPhone || result.shipment.receiverPhone,
        awb: result.shipment.awbNumber,
        receiver: result.shipment.receiverName,
        date: new Date().toLocaleDateString("en-IN"),
      }).catch(err => console.error("[notifyDelivered trigger error]", err));
    }

    return NextResponse.json({ success: true, pod: result.pod });
  } catch (error: any) {
    console.error("API Error POST /api/deliveries/[id]/pod:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
