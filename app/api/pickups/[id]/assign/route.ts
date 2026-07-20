import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PickupService } from "@/lib/services/pickup.service";

// PATCH /api/pickups/[id]/assign — Assign staff to pickup
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();

    const pickup = await PickupService.assignEmployee(
      id,
      body.employeeId,
      session.user.name || "Manager"
    );

    return NextResponse.json({ success: true, pickup });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
