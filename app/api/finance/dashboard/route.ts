import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { FinanceService } from "@/lib/services/finance.service";

// GET /api/finance/dashboard
export async function GET() {
  try {
    const session = await auth();
    const data = await FinanceService.getExecutiveFinanceDashboard();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
