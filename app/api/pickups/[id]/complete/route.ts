import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PickupService } from "@/lib/services/pickup.service";

// POST /api/pickups/[id]/complete — Mark pickup completed/attempted
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();

    const result = await PickupService.completePickup(id, {
      status: body.status || "COMPLETED",
      remarks: body.remarks,
      employeeName: session.user.name || "Staff",
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
