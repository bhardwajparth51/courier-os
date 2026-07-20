import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { FinanceService } from "@/lib/services/finance.service";

// POST /api/finance/cash-session — Close active daily session with difference detection
export async function POST(req: Request) {
  try {
    const session = await auth();
    const { sessionId, closingBalance } = await req.json();
    if (!sessionId) return NextResponse.json({ error: "Active Session ID required" }, { status: 400 });

    const closedSession = await FinanceService.closeCashSession(
      sessionId,
      Number(closingBalance),
      session?.user?.name || "Demo Operator"
    );

    return NextResponse.json({ session: closedSession });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
