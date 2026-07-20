import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FinanceService } from "@/lib/services/finance.service";

// GET /api/finance/bank-deposits — Get list of bank deposits
export async function GET() {
  try {
    const session = await auth();
    const deposits = await prisma.bankDeposit.findMany({ orderBy: { depositDate: "desc" } });
    return NextResponse.json({ deposits });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/finance/bank-deposits — Record physical cash deposit to bank
export async function POST(req: Request) {
  try {
    const session = await auth();
    const { bankName, amount, slipNumber } = await req.json();
    const deposit = await FinanceService.recordBankDeposit({
      bankName,
      amount: Number(amount),
      slipNumber,
      depositedBy: session?.user?.name || "Demo Operator",
    });

    return NextResponse.json({ deposit }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
