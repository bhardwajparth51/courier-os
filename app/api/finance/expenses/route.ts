import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FinanceService } from "@/lib/services/finance.service";

// GET /api/finance/expenses — List overhead expenses
export async function GET() {
  try {
    const session = await auth();
    const expenses = await prisma.expense.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ expenses });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/finance/expenses — Submit new overhead expense
export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json();
    const expense = await FinanceService.submitExpense({
      ...body,
      submittedBy: session?.user?.name || "Demo Operator",
    });

    return NextResponse.json({ expense }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// PATCH /api/finance/expenses — Approve overhead expense (Owner only)
export async function PATCH(req: Request) {
  try {
    const session = await auth();
    const { expenseId } = await req.json();
    const approved = await FinanceService.approveExpense(expenseId, session?.user?.name || "Demo Owner");

    return NextResponse.json({ expense: approved });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
