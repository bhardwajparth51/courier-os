import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { FinanceService } from "@/lib/services/finance.service";

// POST /api/finance/cash-transaction — Record income or expense cashbook entry
export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json();

    const { sessionId, type, category, amount, paymentMode, description } = body;

    const tx = await FinanceService.addCashTransaction(
      sessionId || "demo-session-active",
      {
        type: type || "INCOME",
        category: category || "MISC",
        amount: Number(amount) || 0,
        paymentMode: paymentMode || "CASH",
        description: description || `${type} Entry`,
        createdBy: session?.user?.name || "Counter Operator 1",
      }
    );

    return NextResponse.json({ success: true, transaction: tx }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to log transaction" }, { status: 400 });
  }
}
