import { prisma } from "@/lib/prisma";

// ─────────────────────────────────────────────
// Database statistics
// ─────────────────────────────────────────────

export async function getDatabaseStats() {
  try {
    const [
      shipments, customers, employees, expenses,
      invoices, cashSessions, codSettlements,
      zones, rateCards, auditLogs, securityLogs,
    ] = await Promise.all([
      prisma.shipment.count(),
      prisma.customer.count(),
      prisma.employee.count(),
      prisma.expense.count(),
      prisma.invoice.count(),
      prisma.cashSession.count(),
      prisma.cODSettlement.count(),
      prisma.zone.count(),
      prisma.rateCard.count(),
      prisma.auditLog.count(),
      prisma.securityLog.count(),
    ]);

    return {
      shipments, customers, employees, expenses,
      invoices, cashSessions, codSettlements,
      zones, rateCards, auditLogs, securityLogs,
    };
  } catch (err) {
    console.error("[getDatabaseStats error]", err);
    return {
      shipments: 0, customers: 0, employees: 0, expenses: 0,
      invoices: 0, cashSessions: 0, codSettlements: 0,
      zones: 0, rateCards: 0, auditLogs: 0, securityLogs: 0,
    };
  }
}

// ─────────────────────────────────────────────
// Recent activity summary
// ─────────────────────────────────────────────

export async function getRecentActivity() {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const last7 = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      shipmentsToday, shipmentsWeek,
      revenueToday, revenueWeek,
      pendingCOD,
      openCashSession,
      recentAuditLogs,
    ] = await Promise.all([
      prisma.shipment.count({ where: { createdAt: { gte: today } } }),
      prisma.shipment.count({ where: { createdAt: { gte: last7 } } }),
      prisma.invoice.aggregate({
        where: { issuedAt: { gte: today } },
        _sum: { total: true },
      }),
      prisma.invoice.aggregate({
        where: { issuedAt: { gte: last7 } },
        _sum: { total: true },
      }),
      prisma.cODSettlement.aggregate({
        where: { status: "COLLECTED" },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.cashSession.findFirst({
        where: { status: "OPEN" },
        select: { openedAt: true, openingBalance: true },
      }),
      prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { action: true, entity: true, userEmail: true, createdAt: true },
      }),
    ]);

    return {
      shipmentsToday,
      shipmentsWeek,
      revenueToday:  revenueToday._sum?.total ?? 0,
      revenueWeek:   revenueWeek._sum?.total ?? 0,
      pendingCODAmount: pendingCOD._sum?.amount ?? 0,
      pendingCODCount:  pendingCOD._count ?? 0,
      openCashSession,
      recentAuditLogs,
    };
  } catch (err) {
    console.error("[getRecentActivity error]", err);
    return {
      shipmentsToday: 0,
      shipmentsWeek: 0,
      revenueToday: 0,
      revenueWeek: 0,
      pendingCODAmount: 0,
      pendingCODCount: 0,
      openCashSession: null,
      recentAuditLogs: [],
    };
  }
}

// ─────────────────────────────────────────────
// System info
// ─────────────────────────────────────────────

export function getSystemInfo() {
  return {
    nodeVersion:    process.version,
    platform:       process.platform,
    uptime:         Math.floor(process.uptime()),
    memoryMB:       Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    memoryTotalMB:  Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
    environment:    process.env.NODE_ENV ?? "development",
    timezone:       Intl.DateTimeFormat().resolvedOptions().timeZone,
    timestamp:      new Date().toISOString(),
  };
}

// ─────────────────────────────────────────────
// Database connectivity check
// ─────────────────────────────────────────────

export async function checkDatabaseConnection(): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { ok: true, latencyMs: Date.now() - start };
  } catch (e: any) {
    return { ok: false, latencyMs: Date.now() - start, error: e.message || "Database connection failed" };
  }
}
