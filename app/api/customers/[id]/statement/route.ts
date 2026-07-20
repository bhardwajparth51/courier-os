import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { CustomerService } from "@/lib/services/customer.service";

// GET /api/customers/[id]/statement — Tally-Style Customer Ledger Statement
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const ledger = await CustomerService.getCustomerLedger(id);

    return NextResponse.json(ledger);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
