import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { DispatchService } from "@/lib/services/dispatch.service";

// POST /api/bags/[id]/shipments — Add shipment AWB into bag
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();

    const result = await DispatchService.addShipmentToBag(id, body.awbNumber);
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
