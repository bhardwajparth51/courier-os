import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { DispatchService } from "@/lib/services/dispatch.service";

// POST /api/bags/[id]/seal — Seal & Lock Bag + Generate Manifest
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();

    if (!body.sealNumber) {
      return NextResponse.json({ error: "Seal Number is required to seal bag." }, { status: 400 });
    }

    const result = await DispatchService.sealAndLockBag(
      id,
      body.sealNumber,
      session.user.name || "Operator"
    );

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
