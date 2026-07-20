import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { CustomerService } from "@/lib/services/customer.service";

// POST /api/customers/[id]/documents
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();

    const doc = await CustomerService.addDocument(id, body);
    return NextResponse.json({ document: doc }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
