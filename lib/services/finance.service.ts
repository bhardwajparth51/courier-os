import { prisma } from "@/lib/prisma";
import {
  CashSessionStatus,
  CashTransactionType,
  CashCategory,
  ExpenseCategory,
  ExpenseStatus,
  CODReconciliationStatus
} from "@prisma/client";

export class FinanceService {
  // ── 1. CASHBOOK & COUNTER OPERATIONS ──

  static async openCashSession(branchId: string, openedBy: string, openingBalance: number) {
    // Check if there is already an open session
    const existing = await prisma.cashSession.findFirst({
      where: { branchId, status: "OPEN" },
    });
    if (existing) {
      return existing;
    }

    return prisma.cashSession.create({
      data: {
        branchId,
        openedBy,
        openingBalance,
        closingBalance: 0,
        expectedClosing: openingBalance,
        difference: 0,
        status: "OPEN",
      },
    });
  }

  static async getActiveSession(branchId: string) {
    return prisma.cashSession.findFirst({
      where: { branchId, status: "OPEN" },
      include: { transactions: { orderBy: { createdAt: "desc" } } },
    });
  }

  static async closeCashSession(sessionId: string, closingBalance: number, closedBy: string) {
    const session = await prisma.cashSession.findUnique({
      where: { id: sessionId },
      include: { transactions: true },
    });
    if (!session) throw new Error("Cash session not found");

    // Calculate expected balance: Opening + Incomes - Expenses
    let expected = session.openingBalance;
    for (const tx of session.transactions) {
      if (tx.type === "INCOME") expected += tx.amount;
      else if (tx.type === "EXPENSE" || tx.type === "TRANSFER" || tx.type === "REFUND") {
        expected -= tx.amount;
      }
    }

    const difference = closingBalance - expected;

    return prisma.cashSession.update({
      where: { id: sessionId },
      data: {
        closingBalance,
        expectedClosing: expected,
        difference,
        closedBy,
        closedAt: new Date(),
        status: "CLOSED",
      },
    });
  }

  static async addCashTransaction(
    sessionId: string,
    data: {
      type: CashTransactionType;
      category: CashCategory;
      amount: number;
      paymentMode: string;
      referenceId?: string;
      description?: string;
      createdBy: string;
    }
  ) {
    const tx = await prisma.cashTransaction.create({
      data: {
        sessionId,
        type: data.type,
        category: data.category,
        amount: data.amount,
        paymentMode: data.paymentMode,
        referenceId: data.referenceId,
        description: data.description,
        createdBy: data.createdBy,
      },
    });

    // Update expected closing balance on active session
    const session = await prisma.cashSession.findUnique({ where: { id: sessionId } });
    if (session) {
      let adjustment = 0;
      if (data.type === "INCOME") adjustment = data.amount;
      else if (data.type === "EXPENSE" || data.type === "TRANSFER" || data.type === "REFUND") {
        adjustment = -data.amount;
      }
      await prisma.cashSession.update({
        where: { id: sessionId },
        data: { expectedClosing: session.expectedClosing + adjustment },
      });
    }

    return tx;
  }

  // ── 2. EXPENSES MANAGEMENT ──

  static async submitExpense(data: {
    vendor: string;
    category: ExpenseCategory;
    amount: number;
    gstAmount?: number;
    billNumber?: string;
    attachmentUrl?: string;
    submittedBy: string;
  }) {
    return prisma.expense.create({
      data: {
        vendor: data.vendor,
        category: data.category,
        amount: data.amount,
        gstAmount: data.gstAmount || 0,
        billNumber: data.billNumber,
        attachmentUrl: data.attachmentUrl,
        status: "PENDING",
        submittedBy: data.submittedBy,
      },
    });
  }

  static async approveExpense(expenseId: string, approvedBy: string) {
    const exp = await prisma.expense.findUnique({ where: { id: expenseId } });
    if (!exp) throw new Error("Expense not found");

    const updated = await prisma.expense.update({
      where: { id: expenseId },
      data: {
        status: "APPROVED",
        approvedBy,
      },
    });

    // If active cash session exists, log expense withdrawal automatically from drawer
    const activeSession = await prisma.cashSession.findFirst({
      where: { status: "OPEN" },
    });
    if (activeSession) {
      await this.addCashTransaction(activeSession.id, {
        type: "EXPENSE",
        category: "EXPENSE",
        amount: exp.amount,
        paymentMode: "CASH",
        referenceId: expenseId,
        description: `Approved Expense Category: ${exp.category} for ${exp.vendor}`,
        createdBy: approvedBy,
      });
    }

    return updated;
  }

  // ── 3. CUSTOMER PAYMENTS & COD RECONCILIATION ──

  static async recordCustomerPayment(data: {
    customerId: string;
    amount: number;
    paymentMode: string;
    reference?: string;
    createdBy: string;
  }) {
    const payment = await prisma.customerPayment.create({
      data: {
        customerId: data.customerId,
        amount: data.amount,
        paymentMode: data.paymentMode,
        reference: data.reference,
        createdBy: data.createdBy,
      },
    });

    // If cash payment and active session is open, log it into the drawer
    if (data.paymentMode === "CASH") {
      const activeSession = await prisma.cashSession.findFirst({
        where: { status: "OPEN" },
      });
      if (activeSession) {
        await this.addCashTransaction(activeSession.id, {
          type: "INCOME",
          category: "BOOKING",
          amount: data.amount,
          paymentMode: "CASH",
          referenceId: payment.id,
          description: `Customer payment received: ${data.reference || "Walk-in collection"}`,
          createdBy: data.createdBy,
        });
      }
    }

    return payment;
  }

  static async updateCODSettlementStatus(shipmentId: string, status: CODReconciliationStatus, driverId?: string, reconciledBy?: string) {
    const settlement = await prisma.cODSettlement.findUnique({ where: { shipmentId } });
    if (settlement) {
      const updated = await prisma.cODSettlement.update({
        where: { shipmentId },
        data: {
          status,
          driverId: driverId || settlement.driverId,
          reconciledBy,
          reconciledAt: status === "SETTLED" ? new Date() : undefined,
        },
      });

      // If COD is received at branch in cash, add it to cash session
      if (status === "BRANCH_RECEIVED") {
        const activeSession = await prisma.cashSession.findFirst({
          where: { status: "OPEN" },
        });
        if (activeSession) {
          await this.addCashTransaction(activeSession.id, {
            type: "INCOME",
            category: "COD",
            amount: settlement.amount,
            paymentMode: "CASH",
            referenceId: shipmentId,
            description: `COD collected for AWB: ${shipmentId}`,
            createdBy: reconciledBy || "Cashier Staff",
          });
        }
      }

      return updated;
    } else {
      // Find shipment to fetch COD amount
      const shipment = await prisma.shipment.findFirst({
        where: { OR: [{ id: shipmentId }, { awbNumber: shipmentId }] },
      });
      if (!shipment) throw new Error("Shipment AWB not found");

      const created = await prisma.cODSettlement.create({
        data: {
          shipmentId: shipment.awbNumber,
          driverId,
          amount: shipment.codAmount || shipment.totalAmount,
          status,
          reconciledBy,
          reconciledAt: status === "SETTLED" ? new Date() : undefined,
        },
      });

      if (status === "BRANCH_RECEIVED") {
        const activeSession = await prisma.cashSession.findFirst({
          where: { status: "OPEN" },
        });
        if (activeSession) {
          await this.addCashTransaction(activeSession.id, {
            type: "INCOME",
            category: "COD",
            amount: created.amount,
            paymentMode: "CASH",
            referenceId: shipment.awbNumber,
            description: `COD collected for AWB: ${shipment.awbNumber}`,
            createdBy: reconciledBy || "Cashier Staff",
          });
        }
      }

      return created;
    }
  }

  // ── 4. BANK DEPOSITS ──

  static async recordBankDeposit(data: {
    bankName: string;
    amount: number;
    slipNumber: string;
    depositedBy: string;
    verifiedBy?: string;
  }) {
    const deposit = await prisma.bankDeposit.create({
      data: {
        bankName: data.bankName,
        amount: data.amount,
        slipNumber: data.slipNumber,
        depositedBy: data.depositedBy,
        verifiedBy: data.verifiedBy,
        verifiedAt: data.verifiedBy ? new Date() : null,
      },
    });

    // Automatically reduce drawer cash balance (log TRANSFER out from active session)
    const activeSession = await prisma.cashSession.findFirst({
      where: { status: "OPEN" },
    });
    if (activeSession) {
      await this.addCashTransaction(activeSession.id, {
        type: "TRANSFER",
        category: "BANK_DEPOSIT",
        amount: data.amount,
        paymentMode: "CASH",
        referenceId: deposit.id,
        description: `Cash deposit to ${data.bankName}. Slip No: ${data.slipNumber}`,
        createdBy: data.depositedBy,
      });
    }

    return deposit;
  }

  // ── 5. STATEMENTS & REPORTS ──

  static async generateProfitLoss(startDate?: Date, endDate?: Date) {
    const start = startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate || new Date();

    const shipments = await prisma.shipment.findMany({
      where: { createdAt: { gte: start, lte: end } },
      select: { totalAmount: true },
    });

    const expenses = await prisma.expense.findMany({
      where: { status: "APPROVED", createdAt: { gte: start, lte: end } },
      select: { category: true, amount: true },
    });

    const bookingRevenue = shipments.reduce((acc, s) => acc + s.totalAmount, 0);

    const expenseBreakdown = expenses.reduce((acc: any, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});

    const totalExpense = expenses.reduce((acc, exp) => acc + exp.amount, 0);
    const netProfit = bookingRevenue - totalExpense;

    return {
      revenue: { bookingRevenue, otherIncome: 0, total: bookingRevenue },
      expenses: { breakdown: expenseBreakdown, total: totalExpense },
      netProfit,
    };
  }

  static async generateCashFlow(startDate?: Date, endDate?: Date) {
    const start = startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate || new Date();

    const sessions = await prisma.cashSession.findMany({
      where: { openedAt: { gte: start, lte: end } },
      include: { transactions: true },
    });

    let collections = 0;
    let expenses = 0;
    let bankDeposits = 0;

    sessions.forEach((s) => {
      s.transactions.forEach((t) => {
        if (t.type === "INCOME") collections += t.amount;
        else if (t.type === "EXPENSE") expenses += t.amount;
        else if (t.category === "BANK_DEPOSIT") bankDeposits += t.amount;
      });
    });

    return {
      collections,
      expenses,
      bankDeposits,
      netFlow: collections - expenses - bankDeposits,
    };
  }

  static async getGSTLedger(startDate?: Date, endDate?: Date) {
    const start = startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate || new Date();

    // Sales GST: calculated on shipments booked
    const shipments = await prisma.shipment.findMany({
      where: { createdAt: { gte: start, lte: end } },
      select: { awbNumber: true, totalAmount: true, createdAt: true, senderName: true },
    });

    // SGST/CGST: 9% SGST + 9% CGST (total 18% GST standard in shipments)
    const salesList = shipments.map((s) => {
      const taxableVal = s.totalAmount / 1.18;
      const totalTax = s.totalAmount - taxableVal;
      const cgst = totalTax / 2;
      const sgst = totalTax / 2;
      return {
        date: s.createdAt,
        reference: `AWB #${s.awbNumber}`,
        party: s.senderName,
        taxableValue: Math.round(taxableVal),
        cgst: Math.round(cgst),
        sgst: Math.round(sgst),
        totalGst: Math.round(totalTax),
        type: "OUTPUT_TAX",
      };
    });

    // Purchase Input GST: calculated from approved expenses
    const expenses = await prisma.expense.findMany({
      where: { status: "APPROVED", createdAt: { gte: start, lte: end } },
      select: { vendor: true, amount: true, gstAmount: true, createdAt: true, category: true },
    });

    const purchaseList = expenses.map((e) => ({
      date: e.createdAt,
      reference: `${e.category} Bill`,
      party: e.vendor,
      taxableValue: e.amount - e.gstAmount,
      cgst: Math.round(e.gstAmount / 2),
      sgst: Math.round(e.gstAmount / 2),
      totalGst: e.gstAmount,
      type: "INPUT_TAX",
    }));

    return [...salesList, ...purchaseList];
  }

  static async getExecutiveFinanceDashboard() {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const [shipments, sessions, expenses, cods, deposits] = await Promise.all([
      prisma.shipment.findMany({ select: { totalAmount: true, createdAt: true } }),
      prisma.cashSession.findMany({}),
      prisma.expense.findMany({}),
      prisma.cODSettlement.findMany({}),
      prisma.bankDeposit.findMany({}),
    ]);

    // Active session
    const active = sessions.find((s) => s.status === "OPEN");
    const cashInDrawer = active ? active.expectedClosing : 0;

    // Monthly revenues
    const totalRevenue = shipments.reduce((acc, s) => acc + s.totalAmount, 0);
    const monthlyRevenue = shipments
      .filter((s) => s.createdAt >= startOfMonth)
      .reduce((acc, s) => acc + s.totalAmount, 0);

    // Expenses
    const approvedExpenses = expenses.filter((e) => e.status === "APPROVED");
    const totalExpensesAmount = approvedExpenses.reduce((acc, e) => acc + e.amount, 0);

    // COD stats
    const pendingCOD = cods
      .filter((c) => c.status !== "SETTLED")
      .reduce((acc, c) => acc + c.amount, 0);

    const bankBalance = deposits.reduce((acc, d) => acc + d.amount, 0);

    return {
      todayRevenue: monthlyRevenue / 30, // Mocked representation or calculate actual today
      monthlyRevenue,
      cashInDrawer,
      bankBalance,
      expenses: totalExpensesAmount,
      profit: totalRevenue - totalExpensesAmount,
      pendingCOD,
      outstandingPayments: 0,
    };
  }
}
