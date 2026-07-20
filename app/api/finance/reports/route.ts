import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { FinanceService } from "@/lib/services/finance.service";

// GET /api/finance/reports — Generate P&L and Cash Flow report datasets
export async function GET() {
  try {
    const session = await auth();
    const [profitLoss, cashFlow] = await Promise.all([
      FinanceService.generateProfitLoss(),
      FinanceService.generateCashFlow(),
    ]);

    return NextResponse.json({ profitLoss, cashFlow });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
