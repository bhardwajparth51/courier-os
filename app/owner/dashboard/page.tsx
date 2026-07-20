import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OwnerBentoDashboard } from "@/components/owner/OwnerBentoDashboard";

export default async function OwnerDashboardPage() {
  const session = await auth();

  // ── Date ranges ──────────────────────────────────────────────
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const ninetyDaysAgo = new Date(today);
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 89);

  // ── KPI & Analytical Queries ─────────────────────────────────
  const [
    todayShipments,
    todayDelivered,
    todayPendingPickup,
    todayRevenue,
    todayCOD,
    totalCustomers,
    recentShipments,
    allShipments90d,
    statusCounts,
    serviceCounts,
    destinationCounts,
    lowInventoryItems,
    recentActivityEvents,
  ] = await Promise.all([
    prisma.shipment.count({ where: { createdAt: { gte: today, lt: tomorrow } } }),
    prisma.shipment.count({ where: { status: "DELIVERED", updatedAt: { gte: today, lt: tomorrow } } }),
    prisma.shipment.count({ where: { status: { in: ["AWAITING_PICKUP", "BOOKED"] } } }),
    prisma.payment.aggregate({
      where: { createdAt: { gte: today, lt: tomorrow }, status: "COLLECTED" },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { method: "COD", status: "COLLECTED", createdAt: { gte: today, lt: tomorrow } },
      _sum: { codAmount: true },
    }),
    prisma.customer.count(),
    prisma.shipment.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        awbNumber: true,
        receiverCity: true,
        receiverState: true,
        status: true,
        totalAmount: true,
        serviceType: true,
        createdAt: true,
        senderName: true,
        receiverName: true,
        paymentMethod: true,
      },
    }),
    // Revenue by day for last 90 days
    prisma.shipment.findMany({
      where: { createdAt: { gte: ninetyDaysAgo } },
      select: { createdAt: true, totalAmount: true },
      orderBy: { createdAt: "asc" },
    }),
    // Status breakdown
    prisma.shipment.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
    // Service type breakdown
    prisma.shipment.groupBy({
      by: ["serviceType"],
      _count: { serviceType: true },
    }),
    // Top destinations
    prisma.shipment.groupBy({
      by: ["receiverCity"],
      _count: { receiverCity: true },
      orderBy: { _count: { receiverCity: "desc" } },
      take: 6,
    }),
    // Low Inventory items
    prisma.inventory.findMany({
      where: { currentStock: { lte: 15 } },
      take: 4,
      orderBy: { currentStock: "asc" },
    }),
    // Recent Tracking Events for Live Feed
    prisma.trackingEvent.findMany({
      take: 6,
      orderBy: { timestamp: "desc" },
      include: { shipment: { select: { awbNumber: true } } },
    }),
  ]);

  // ── Helper to format revenue data for N days ─────────────────
  const formatRevenueData = (daysCount: number) => {
    const daysMap: Record<string, number> = {};
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      daysMap[key] = 0;
    }
    const cutoff = new Date(today);
    cutoff.setDate(cutoff.getDate() - (daysCount - 1));

    for (const s of allShipments90d) {
      if (new Date(s.createdAt) >= cutoff) {
        const key = new Date(s.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
        if (key in daysMap) daysMap[key] += s.totalAmount;
      }
    }
    return Object.entries(daysMap).map(([day, revenue]) => ({ day, revenue }));
  };

  const revenueData7d = formatRevenueData(7);
  const revenueData30d = formatRevenueData(30);
  const revenueData90d = formatRevenueData(90);

  // ── Sparkline (last 7 days) ───────────────────────────────────
  const sparkData = revenueData7d.map((d) => ({ value: d.revenue }));

  // ── Colors ───────────────────────────────────────────────────
  const STATUS_COLORS: Record<string, string> = {
    DELIVERED: "#16A34A",
    OUT_FOR_DELIVERY: "#2563EB",
    IN_TRANSIT: "#7C3AED",
    BOOKED: "#9CA3AF",
    AWAITING_PICKUP: "#D97706",
    COLLECTED: "#0891B2",
    ORIGIN_HUB: "#7C3AED",
    REGIONAL_HUB: "#7C3AED",
    SORTING_CENTER: "#EA580C",
    DESTINATION_HUB: "#EA580C",
    CANCELLED: "#DC2626",
    RTO: "#DC2626",
  };

  const SERVICE_COLORS: Record<string, string> = {
    EXPRESS: "#E31E24",
    STANDARD: "#2563EB",
    SURFACE: "#16A34A",
    INTERNATIONAL: "#7C3AED",
  };

  const serviceChartData = serviceCounts.map((s) => ({
    name: s.serviceType,
    value: s._count.serviceType,
    color: SERVICE_COLORS[s.serviceType] ?? "#9CA3AF",
  }));

  const destChartData = destinationCounts.map((d) => ({
    name: d.receiverCity,
    value: d._count.receiverCity,
  }));

  const statusChartData = statusCounts
    .sort((a, b) => b._count.status - a._count.status)
    .slice(0, 5)
    .map((s) => ({
      name: s.status.replace(/_/g, " "),
      value: s._count.status,
      color: STATUS_COLORS[s.status] ?? "#9CA3AF",
    }));

  const todayRevenueVal = todayRevenue._sum.amount ?? 0;
  const todayCODVal = todayCOD._sum.codAmount ?? 0;

  return (
    <OwnerBentoDashboard
      userName={session?.user?.name}
      kpis={{
        revenue: todayRevenueVal,
        bookings: todayShipments,
        pendingPickup: todayPendingPickup,
        delivered: todayDelivered,
        cod: todayCODVal,
        customers: totalCustomers,
      }}
      revenueData7d={revenueData7d}
      revenueData30d={revenueData30d}
      revenueData90d={revenueData90d}
      sparkData={sparkData}
      recentShipments={recentShipments}
      serviceChartData={serviceChartData}
      destChartData={destChartData}
      statusChartData={statusChartData}
      lowInventoryItems={lowInventoryItems}
      recentActivityEvents={recentActivityEvents}
    />
  );
}
