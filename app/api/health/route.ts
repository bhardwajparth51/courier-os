import { NextResponse } from "next/server";
import { getDatabaseStats, getSystemInfo, checkDatabaseConnection, getRecentActivity } from "@/lib/services/health.service";

export async function GET() {
  try {
    const [db, stats, activity, sysInfo] = await Promise.all([
      checkDatabaseConnection(),
      getDatabaseStats(),
      getRecentActivity(),
      Promise.resolve(getSystemInfo()),
    ]);

    const status = db.ok ? "healthy" : "degraded";

    return NextResponse.json({
      status,
      db,
      stats,
      activity,
      system: sysInfo,
    });
  } catch (err: any) {
    console.error("[health GET]", err);
    return NextResponse.json({
      status: "error",
      error: err.message || "Failed to check system health",
      db: { ok: false, latencyMs: 0, error: err.message },
      stats: {
        shipments: 0, customers: 0, employees: 0, expenses: 0,
        invoices: 0, cashSessions: 0, codSettlements: 0,
        zones: 0, rateCards: 0, auditLogs: 0, securityLogs: 0,
      },
      activity: {
        shipmentsToday: 0, shipmentsWeek: 0, revenueToday: 0, revenueWeek: 0,
        pendingCODAmount: 0, pendingCODCount: 0, openCashSession: null, recentAuditLogs: [],
      },
      system: getSystemInfo(),
    }, { status: 200 });
  }
}
