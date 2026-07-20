import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { FinanceService } from "@/lib/services/finance.service";

// GET /api/finance/cashbook — Get active drawer session
export async function GET(req: Request) {
  try {
    const session = await auth();
    const activeSession = await FinanceService.getActiveSession("PUNE_CENTRAL");
    return NextResponse.json({ activeSession });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/finance/cashbook — Open new daily float session
export async function POST(req: Request) {
  try {
    const session = await auth();
    const { openingBalance } = await req.json();
    const newSession = await FinanceService.openCashSession(
      "PUNE_CENTRAL",
      session?.user?.name || "Demo Operator",
      Number(openingBalance)
    );

    return NextResponse.json({ session: newSession }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
