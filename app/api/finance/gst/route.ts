import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { FinanceService } from "@/lib/services/finance.service";

// GET /api/finance/gst — Get sales/purchase registers and tax sums
export async function GET() {
  try {
    const session = await auth();
    const ledger = await FinanceService.getGSTLedger();
    return NextResponse.json({ ledger });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
