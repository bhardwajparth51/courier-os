"use client";

import { useState, useMemo } from "react";
import {
  TrendingUp, Package, Truck, CheckCircle, Banknote,
  Users, ArrowUpRight, Clock, Activity, BarChart2,
  PlusCircle, UserPlus, FileText, Search, Download,
  AlertTriangle, Radio, Compass, CheckCheck, Box,
  ArrowUpRight as ArrowIcon
} from "lucide-react";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { Sparkline, RevenueChart, DonutChart, HBarChart, StatusProgressBars } from "@/components/Charts";

const STATUS_BADGE: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  BOOKED:           { label: "Booked",          bg: "#EFF6FF", color: "#1D4ED8", dot: "#3B82F6" },
  AWAITING_PICKUP:  { label: "Awaiting Pickup", bg: "#FFFBEB", color: "#B45309", dot: "#F59E0B" },
  COLLECTED:        { label: "Collected",       bg: "#EFF6FF", color: "#1D4ED8", dot: "#3B82F6" },
  ORIGIN_HUB:       { label: "Origin Hub",      bg: "#F5F3FF", color: "#6D28D9", dot: "#8B5CF6" },
  REGIONAL_HUB:     { label: "Regional Hub",    bg: "#F5F3FF", color: "#6D28D9", dot: "#8B5CF6" },
  SORTING_CENTER:   { label: "Sorting Center",  bg: "#FFFBEB", color: "#B45309", dot: "#F59E0B" },
  DESTINATION_HUB:  { label: "Dest. Hub",       bg: "#FFFBEB", color: "#B45309", dot: "#F59E0B" },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", bg: "#EFF6FF", color: "#1D4ED8", dot: "#3B82F6" },
  DELIVERED:        { label: "Delivered",       bg: "#DCFCE7", color: "#15803D", dot: "#22C55E" },
  CANCELLED:        { label: "Cancelled",       bg: "#FEF2F2", color: "#B91C1C", dot: "#EF4444" },
  RTO:              { label: "RTO",             bg: "#FEF2F2", color: "#B91C1C", dot: "#EF4444" },
};

interface Shipment {
  awbNumber: string;
  senderName: string;
  receiverName: string;
  receiverCity: string;
  receiverState: string;
  status: string;
  serviceType: string;
  totalAmount: number;
  paymentMethod: string;
  createdAt: Date;
}

interface InventoryItem {
  id: string;
  itemName: string;
  currentStock: number;
  unit: string;
  reorderLevel: number;
}

interface ActivityEvent {
  id: string;
  status: string;
  location: string;
  timestamp: Date;
  shipment: { awbNumber: string };
}

interface Props {
  userName?: string | null;
  kpis: {
    revenue: number;
    bookings: number;
    pendingPickup: number;
    delivered: number;
    cod: number;
    customers: number;
  };
  revenueData7d: { day: string; revenue: number }[];
  revenueData30d: { day: string; revenue: number }[];
  revenueData90d: { day: string; revenue: number }[];
  sparkData: { value: number }[];
  recentShipments: Shipment[];
  serviceChartData: { name: string; value: number; color: string }[];
  destChartData: { name: string; value: number }[];
  statusChartData: { name: string; value: number; color: string }[];
  lowInventoryItems: InventoryItem[];
  recentActivityEvents: ActivityEvent[];
}

export function OwnerBentoDashboard({
  userName, kpis, revenueData7d, revenueData30d, revenueData90d, sparkData,
  recentShipments, serviceChartData, destChartData, statusChartData,
  lowInventoryItems, recentActivityEvents,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const todayDateStr = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long",
  });

  // Filtered shipments
  const filteredShipments = useMemo(() => {
    return recentShipments.filter((s) => {
      const matchesSearch =
        s.awbNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.receiverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.receiverCity.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "ALL" || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [recentShipments, searchQuery, statusFilter]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["AWB,Sender,Receiver,Destination,Service,Status,Amount\n"];
    const rows = filteredShipments.map(
      (s) => `${s.awbNumber},"${s.senderName}","${s.receiverName}","${s.receiverCity}",${s.serviceType},${s.status},${s.totalAmount}`
    );
    const blob = new Blob([headers.concat(rows.join("\n")).join("")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shipments_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="page-container">

      {/* ── 1. HERO HEADER + QUICK ACTIONS ── */}
      <div style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500, letterSpacing: "-0.01em" }}>
            {todayDateStr}
          </div>
          <h1 style={{ fontFamily: "Outfit, sans-serif", fontSize: 24, fontWeight: 700, color: "var(--text-primary)", marginTop: 1 }}>
            Good Morning, {userName?.split(" ")[0] ?? "Owner"}! 👋
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
            Here is your DTDC franchise operations overview for today.
          </p>
        </div>

        {/* Top Right Quick Actions */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a href="/employee/shipments/new" className="btn btn-primary">
            <PlusCircle size={15} />
            New Shipment
          </a>
          <a href="/owner/customers" className="btn btn-secondary">
            <UserPlus size={15} color="#2563EB" />
            Add Customer
          </a>
          <a href="/owner/reports" className="btn btn-secondary">
            <FileText size={15} color="#8B5CF6" />
            Generate Report
          </a>
        </div>
      </div>

      {/* ── 2. PREMIUM KPI CARDS ROW ── */}
      <div className="bento-grid" style={{ marginBottom: 24 }}>
        {/* Revenue Hero Card (span 4) */}
        <div
          className="card card-hover"
          style={{
            gridColumn: "span 4",
            padding: "20px 22px 14px",
            background: "linear-gradient(135deg, #09090B 0%, #18181B 100%)",
            border: "1px solid #27272A",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Subtle Ambient Red Glow */}
          <div style={{
            position: "absolute", top: -40, right: -40, width: 140, height: 140,
            background: "radial-gradient(circle, rgba(227,30,36,0.35) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <TrendingUp size={16} color="#FF6B6B" />
              <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Revenue Today
              </span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#34D399", background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.25)", padding: "2px 8px", borderRadius: 99 }}>
              ↑ 12.4%
            </span>
          </div>
          <div style={{ fontFamily: "Outfit, sans-serif", fontSize: 32, fontWeight: 800, color: "#FFFFFF", lineHeight: 1, marginBottom: 4 }}>
            ₹<AnimatedCounter value={kpis.revenue} />
          </div>
          <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>
            {kpis.bookings} shipments booked today
          </div>
          <Sparkline data={sparkData} color="#EF4444" />
        </div>

        {/* Bookings Card (span 2) */}
        <div className="card card-hover" style={{ gridColumn: "span 2", padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Bookings
            </span>
            <Package size={18} color="#2563EB" />
          </div>
          <div style={{ fontFamily: "Outfit, sans-serif", fontSize: 30, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1, marginTop: 10 }}>
            <AnimatedCounter value={kpis.bookings} />
          </div>
          <div style={{ fontSize: 11.5, color: "var(--status-green)", fontWeight: 600, marginTop: 6, display: "flex", alignItems: "center", gap: 3 }}>
            <span>↑ 12%</span>
            <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>vs yesterday</span>
          </div>
        </div>

        {/* Pending Pickup Card (span 2) */}
        <div className="card card-hover" style={{ gridColumn: "span 2", padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Pending
            </span>
            <Truck size={18} color="#D97706" />
          </div>
          <div style={{ fontFamily: "Outfit, sans-serif", fontSize: 30, fontWeight: 800, color: "#D97706", lineHeight: 1, marginTop: 10 }}>
            <AnimatedCounter value={kpis.pendingPickup} />
          </div>
          <div style={{ fontSize: 11.5, color: "#D97706", fontWeight: 600, marginTop: 6 }}>
            +3 <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>in queue</span>
          </div>
        </div>

        {/* Delivered Card (span 2) */}
        <div className="card card-hover" style={{ gridColumn: "span 2", padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Delivered
            </span>
            <CheckCircle size={18} color="#16A34A" />
          </div>
          <div style={{ fontFamily: "Outfit, sans-serif", fontSize: 30, fontWeight: 800, color: "var(--status-green)", lineHeight: 1, marginTop: 10 }}>
            <AnimatedCounter value={kpis.delivered} />
          </div>
          <div style={{ fontSize: 11.5, color: "var(--status-green)", fontWeight: 600, marginTop: 6 }}>
            96% <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>Success Rate</span>
          </div>
        </div>

        {/* COD Card (span 2) */}
        <div className="card card-hover" style={{ gridColumn: "span 2", padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              COD
            </span>
            <Banknote size={18} color="#7C3AED" />
          </div>
          <div style={{ fontFamily: "Outfit, sans-serif", fontSize: 24, fontWeight: 800, color: "var(--status-purple)", lineHeight: 1, marginTop: 10 }}>
            ₹<AnimatedCounter value={kpis.cod} />
          </div>
          <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 6 }}>
            {kpis.customers} customers
          </div>
        </div>
      </div>

      {/* ── 3. CHARTS ROW: REVENUE (8 cols) + SERVICE DONUT (4 cols) ── */}
      <div className="bento-grid" style={{ marginBottom: 24 }}>
        {/* Revenue Chart with Range Filters */}
        <div className="card" style={{ gridColumn: "span 8", padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <BarChart2 size={16} color="var(--brand-red)" />
              <span style={{ fontWeight: 700, fontSize: 14.5, color: "var(--text-primary)" }}>Revenue Trends</span>
            </div>
          </div>
          <RevenueChart data7d={revenueData7d} data30d={revenueData30d} data90d={revenueData90d} />
        </div>

        {/* Service Types Donut */}
        <div className="card" style={{ gridColumn: "span 4", padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Activity size={16} color="var(--status-blue)" />
            <span style={{ fontWeight: 700, fontSize: 14.5, color: "var(--text-primary)" }}>Service Types</span>
          </div>
          <DonutChart data={serviceChartData.length > 0 ? serviceChartData : [
            { name: "Express", value: 15, color: "#E31E24" },
            { name: "Standard", value: 31, color: "#3B82F6" },
            { name: "Surface", value: 7, color: "#10B981" },
            { name: "International", value: 2, color: "#8B5CF6" },
          ]} />
        </div>
      </div>

      {/* ── 4. ANALYTICS ROW: TOP DESTINATIONS (4 cols) + STATUS BREAKDOWN (4 cols) + OPERATIONS INSIGHTS (4 cols) ── */}
      <div className="bento-grid" style={{ marginBottom: 24 }}>

        {/* Top Destinations */}
        <div className="card" style={{ gridColumn: "span 4", padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Compass size={16} color="var(--brand-red)" />
            <span style={{ fontWeight: 700, fontSize: 14.5, color: "var(--text-primary)" }}>Top Destinations</span>
          </div>
          <HBarChart data={destChartData.length > 0 ? destChartData : [
            { name: "Delhi", value: 28 },
            { name: "Mumbai", value: 22 },
            { name: "Bangalore", value: 18 },
            { name: "Hyderabad", value: 14 },
            { name: "Ahmedabad", value: 10 },
          ]} color="var(--brand-red)" />
        </div>

        {/* Status Breakdown */}
        <div className="card" style={{ gridColumn: "span 4", padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <CheckCheck size={16} color="var(--status-green)" />
            <span style={{ fontWeight: 700, fontSize: 14.5, color: "var(--text-primary)" }}>Shipment Status</span>
          </div>
          <StatusProgressBars data={statusChartData.length > 0 ? statusChartData : [
            { name: "Delivered", value: 62, color: "var(--status-green)" },
            { name: "Out For Delivery", value: 14, color: "var(--status-blue)" },
            { name: "In Transit", value: 19, color: "var(--status-purple)" },
            { name: "Awaiting Pickup", value: 8, color: "#D97706" },
          ]} />
        </div>

        {/* Operations Insights */}
        <div className="card" style={{ gridColumn: "span 4", padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Radio size={16} color="var(--status-purple)" />
            <span style={{ fontWeight: 700, fontSize: 14.5, color: "var(--text-primary)" }}>Operations Insights</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { label: "Peak Booking Hour", val: "10:00 – 11:00 AM", sub: "34% of daily walk-ins" },
              { label: "Top Destination", val: "Delhi NCR", sub: "Most popular route" },
              { label: "Avg. Parcel Weight", val: "1.7 kg", sub: "Standard package size" },
              { label: "Repeat Customers", val: "62%", sub: "High retention rate" },
              { label: "Avg. Delivery Time", val: "2.1 Days", sub: "Fast transit efficiency" },
            ].map((insight) => (
              <div key={insight.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--text-primary)" }}>{insight.label}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{insight.sub}</div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", background: "var(--bg-muted)", padding: "3px 9px", borderRadius: 6 }}>
                  {insight.val}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── 5. RECENT SHIPMENTS TABLE WITH SEARCH, FILTER & EXPORT ── */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 22px",
            borderBottom: "1px solid var(--border)",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Clock size={16} color="var(--text-muted)" />
            <span style={{ fontWeight: 700, fontSize: 14.5, color: "var(--text-primary)" }}>Recent Shipments</span>
            <span className="badge badge-gray" style={{ fontSize: 11 }}>{filteredShipments.length}</span>
          </div>

          {/* Search, Filter & Export Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div style={{ position: "relative", width: 210 }}>
              <Search size={14} color="var(--text-muted)" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                className="input"
                placeholder="Search AWB or Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: 30, fontSize: 12.5, height: 34 }}
              />
            </div>

            <select
              className="select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ fontSize: 12.5, height: 34 }}
            >
              <option value="ALL">All Statuses</option>
              <option value="BOOKED">Booked</option>
              <option value="AWAITING_PICKUP">Awaiting Pickup</option>
              <option value="COLLECTED">Collected</option>
              <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
              <option value="DELIVERED">Delivered</option>
            </select>

            <button
              type="button"
              onClick={handleExportCSV}
              className="btn btn-secondary btn-sm"
              style={{ gap: 6, height: 34 }}
            >
              <Download size={13} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>AWB Number</th>
                <th>Sender</th>
                <th>Receiver</th>
                <th>Destination</th>
                <th>Service</th>
                <th>Status</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredShipments.slice(0, 8).map((s) => {
                const badge = STATUS_BADGE[s.status] ?? { label: s.status, bg: "#F1F5F9", color: "#475569", dot: "#94A3B8" };
                return (
                  <tr key={s.awbNumber}>
                    <td>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>
                        {s.awbNumber}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500, fontSize: 13 }}>{s.senderName}</td>
                    <td style={{ fontSize: 13 }}>{s.receiverName}</td>
                    <td style={{ color: "var(--text-muted)", fontSize: 12.5 }}>{s.receiverCity}, {s.receiverState}</td>
                    <td><span className="badge badge-gray" style={{ fontSize: 11 }}>{s.serviceType}</span></td>
                    <td>
                      <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "2px 8px",
                        borderRadius: 99,
                        fontSize: 11,
                        fontWeight: 600,
                        background: badge.bg,
                        color: badge.color,
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: badge.dot }} />
                        {badge.label}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, fontSize: 13 }}>₹{s.totalAmount.toLocaleString("en-IN")}</td>
                  </tr>
                );
              })}
              {filteredShipments.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: 32, color: "var(--text-muted)" }}>
                    No matching shipments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 6. INVENTORY ALERTS (6 cols) + LIVE ACTIVITY FEED (6 cols) ── */}
      <div className="bento-grid">

        {/* Ultra-Clean Inventory Alerts (Linear / Stripe Style) */}
        <div className="card" style={{ gridColumn: "span 6", padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <AlertTriangle size={16} color="#D97706" />
              <span style={{ fontWeight: 700, fontSize: 14.5, color: "var(--text-primary)" }}>Inventory Alerts</span>
            </div>
            <a href="/owner/inventory" className="btn btn-ghost btn-sm" style={{ fontSize: 12, gap: 4 }}>
              Manage Stock <ArrowUpRight size={12} />
            </a>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {lowInventoryItems.map((item) => {
              const isCritical = item.currentStock <= 5;
              const maxStock = item.reorderLevel * 2 || 20;
              const stockPct = Math.min(Math.round((item.currentStock / maxStock) * 100), 100);

              return (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 14px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    transition: "border-color 0.15s ease",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0, paddingRight: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <Box size={14} color="var(--text-muted)" />
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                        {item.itemName}
                      </span>
                    </div>

                    {/* Stock Progress Track */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 5, background: "var(--bg-muted)", borderRadius: 99, overflow: "hidden" }}>
                        <div
                          style={{
                            height: "100%",
                            width: `${stockPct}%`,
                            background: isCritical ? "var(--status-red)" : "var(--status-amber)",
                            borderRadius: 99,
                          }}
                        />
                      </div>
                      <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                        Threshold: {item.reorderLevel} {item.unit}
                      </span>
                    </div>
                  </div>

                  {/* Stock Tag & Status */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end", marginBottom: 2 }}>
                      <span className={isCritical ? "status-dot status-dot-red status-dot-pulse" : "status-dot status-dot-amber"} />
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: isCritical ? "var(--status-red)" : "#D97706" }}>
                        {isCritical ? "Critical" : "Low Stock"}
                      </span>
                    </div>
                    <div style={{ fontSize: 12.5, fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                      {item.currentStock} {item.unit} Left
                    </div>
                  </div>
                </div>
              );
            })}

            {lowInventoryItems.length === 0 && (
              <div style={{ padding: "24px 0", textAlign: "center", color: "var(--status-green)", fontSize: 13, fontWeight: 500 }}>
                ✓ All inventory stock levels are healthy
              </div>
            )}
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="card" style={{ gridColumn: "span 6", padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Activity size={16} color="var(--status-green)" />
              <span style={{ fontWeight: 700, fontSize: 14.5, color: "var(--text-primary)" }}>Live Activity Feed</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div className="status-dot status-dot-green status-dot-pulse" />
              <span style={{ fontSize: 11.5, color: "var(--text-muted)", fontWeight: 500 }}>Real-time stream</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {recentActivityEvents.slice(0, 5).map((ev) => (
              <div key={ev.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 10, borderBottom: "1px solid var(--border-subtle)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                    {new Date(ev.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--text-primary)" }}>
                      Shipment <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>{ev.shipment.awbNumber}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{ev.location}</div>
                  </div>
                </div>
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "2px 7px",
                  borderRadius: 99,
                  fontSize: 10,
                  fontWeight: 600,
                  background: STATUS_BADGE[ev.status]?.bg ?? "#F1F5F9",
                  color: STATUS_BADGE[ev.status]?.color ?? "#475569",
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: STATUS_BADGE[ev.status]?.dot ?? "#94A3B8" }} />
                  {STATUS_BADGE[ev.status]?.label ?? ev.status}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
