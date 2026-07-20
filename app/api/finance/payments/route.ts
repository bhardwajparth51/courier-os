import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FinanceService } from "@/lib/services/finance.service";

// GET /api/finance/payments — Get payment collections log
export async function GET() {
  try {
    const session = await auth();
    const payments = await prisma.customerPayment.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ payments });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/finance/payments — Record customer booking collections
export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json();
    const payment = await FinanceService.recordCustomerPayment({
      ...body,
      createdBy: session?.user?.name || "Demo Operator",
    });

    return NextResponse.json({ payment }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
