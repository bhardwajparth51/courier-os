import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { CustomerService } from "@/lib/services/customer.service";

// POST /api/customers/[id]/communications
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();

    const comm = await CustomerService.addCommunication(id, {
      ...body,
      loggedBy: session.user.name || "Staff Operator",
    });

    return NextResponse.json({ communication: comm }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
