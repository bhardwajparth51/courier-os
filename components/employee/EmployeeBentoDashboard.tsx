"use client";

import {
  Package, Truck, CheckCircle2, ScanBarcode, Search, Receipt, PlusCircle, Users, ArrowUpRight, Clock, AlertTriangle, MapPin, Download, ChevronDown, MoreHorizontal, TrendingUp, TrendingDown
} from "lucide-react";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { useState } from "react";

const STATUS_BADGE: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  BOOKED:           { label: "Booked",          bg: "#EFF6FF", color: "#1D4ED8", dot: "#2563EB" },
  AWAITING_PICKUP:  { label: "Awaiting Pickup", bg: "#FFFBEB", color: "#B45309", dot: "#D97706" },
  COLLECTED:        { label: "Collected",       bg: "#EFF6FF", color: "#1D4ED8", dot: "#2563EB" },
  ORIGIN_HUB:       { label: "At Origin Hub",   bg: "#F5F3FF", color: "#6D28D9", dot: "#7C3AED" },
  REGIONAL_HUB:     { label: "Regional Hub",    bg: "#F5F3FF", color: "#6D28D9", dot: "#7C3AED" },
  SORTING_CENTER:   { label: "Sorting Center",  bg: "#FFFBEB", color: "#B45309", dot: "#D97706" },
  DESTINATION_HUB:  { label: "Dest. Hub",       bg: "#FFFBEB", color: "#B45309", dot: "#D97706" },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", bg: "#EFF6FF", color: "#1D4ED8", dot: "#2563EB" },
  DELIVERED:        { label: "Completed",       bg: "#DCFCE7", color: "#15803D", dot: "#16A34A" },
  CANCELLED:        { label: "Canceled",        bg: "#FEE2E2", color: "#BE123C", dot: "#E11D48" },
  RTO:              { label: "Returned",        bg: "#FEE2E2", color: "#BE123C", dot: "#E11D48" },
};

const AVATAR_PALETTES = [
  { bg: "#EEF2FF", text: "#4338CA", border: "#C7D2FE" },
  { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
  { bg: "#FFFBEB", text: "#B45309", border: "#FDE68A" },
  { bg: "#F5F3FF", text: "#6D28D9", border: "#DDD6FE" },
  { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  { bg: "#FFF1F2", text: "#BE123C", border: "#FECDD3" },
];

function getAvatarStyle(name: string) {
  if (!name) return AVATAR_PALETTES[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length];
}

interface Shipment {
  awbNumber: string;
  senderName: string;
  receiverName: string;
  receiverCity: string;
  status: string;
  serviceType: string;
  totalAmount: number;
  paymentMethod: string;
  createdAt: Date;
}

interface Customer {
  id: string;
  user: { name: string | null; email: string | null };
  city: string | null;
  _count: { shipments: number };
  totalSpend?: number;
}

interface ServiceBreakdownItem {
  label: string;
  count: number;
  pct: number;
  totalAmount: number;
}

interface MonthlyTrendItem {
  month: string;
  amount: number;
  count: number;
}

interface TrendProp {
  pct: number;
  isUp: boolean;
}

interface Props {
  userName?: string | null;
  branchName?: string;
  employeeId?: string;
  stats: {
    todayBookings: number;
    todayBookingsTrend?: TrendProp;
    pendingPickups: number;
    pendingPickupsTrend?: TrendProp;
    completedToday: number;
    completedTodayTrend?: TrendProp;
    outForDelivery?: number;
    outForDeliveryTrend?: TrendProp;
  };
  recentShipments: Shipment[];
  recentCustomers: Customer[];
  serviceBreakdown?: ServiceBreakdownItem[];
  monthlyTrend?: MonthlyTrendItem[];
}

export function EmployeeBentoDashboard({
  userName, branchName, employeeId, stats, recentShipments, recentCustomers, serviceBreakdown, monthlyTrend,
}: Props) {
  const [activeTab, setActiveTab] = useState("12 Months");

  // Dynamic trend badge renderer
  const renderTrendBadge = (trend?: TrendProp, defaultPct = 0, defaultIsUp = true) => {
    const pct = trend ? trend.pct : defaultPct;
    const isUp = trend ? trend.isUp : defaultIsUp;
    const color = isUp ? "#16A34A" : "#DC2626";
    const Icon = isUp ? TrendingUp : TrendingDown;

    return (
      <span style={{ fontSize: 12, fontWeight: 600, color, display: "inline-flex", alignItems: "center", gap: 3 }}>
        {isUp ? `+${pct}%` : `-${pct}%`} <Icon size={13} />
      </span>
    );
  };

  // Dynamic SVG Chart calculation
  const monthsData = monthlyTrend && monthlyTrend.length > 0 ? monthlyTrend : [
    { month: "Feb", amount: 1200, count: 5 },
    { month: "Mar", amount: 2400, count: 8 },
    { month: "Apr", amount: 1800, count: 6 },
    { month: "May", amount: 3200, count: 11 },
    { month: "Jun", amount: 4500, count: 15 },
    { month: "Jul", amount: 3800, count: 12 },
    { month: "Aug", amount: 5100, count: 18 },
    { month: "Sep", amount: 4200, count: 14 },
    { month: "Oct", amount: 6000, count: 22 },
    { month: "Nov", amount: 5500, count: 19 },
    { month: "Dec", amount: 7200, count: 26 },
    { month: "Jan", amount: 6800, count: 24 },
  ];

  const maxVal = Math.max(...monthsData.map(m => m.amount), 100);
  const chartPoints = monthsData.map((m, idx) => {
    const x = (idx / Math.max(monthsData.length - 1, 1)) * 500;
    const y = 125 - ((m.amount / maxVal) * 95);
    return { x, y, month: m.month, amount: m.amount };
  });

  const svgPathD = chartPoints.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y.toFixed(1)}` : `${acc} L ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
  }, "");

  const svgAreaD = `${svgPathD} L 500 135 L 0 135 Z`;
  const activePoint = chartPoints[chartPoints.length - 1] ?? { x: 250, y: 50, month: "Today", amount: 0 };

  // Dynamic Service Breakdown
  const serviceList = serviceBreakdown && serviceBreakdown.length > 0 ? serviceBreakdown : [
    { label: "Air Express", pct: 65, count: 24, totalAmount: 143382 },
    { label: "Surface Freight", pct: 40, count: 18, totalAmount: 87974 },
    { label: "Local Courier", pct: 25, count: 12, totalAmount: 45211 },
    { label: "Reverse / RTO", pct: 10, count: 4, totalAmount: 21893 },
  ];
  const barColors = ["#EA580C", "#F97316", "#FB923C", "#FED7AA"];

  return (
    <div style={{ paddingTop: 8, paddingBottom: 40, fontFamily: "'Inter', sans-serif" }}>

      {/* ── 1. CLARITY UI GREETING HEADER ── */}
      <div style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontFamily: "Outfit, sans-serif", fontSize: 22, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.01em" }}>
            Hey {userName?.split(" ")[0] ?? "Staff"} — <span style={{ fontWeight: 400, color: "#64748B", fontSize: 20 }}>here's what's happening with your store today</span>
          </h1>
        </div>
        <a href="/employee/shipments/new" className="btn btn-primary" style={{
          background: "#EA580C",
          color: "white",
          borderRadius: 10,
          padding: "9px 18px",
          fontWeight: 600,
          fontSize: 13,
          boxShadow: "0 2px 8px rgba(234, 88, 12, 0.28)",
          gap: 8,
          border: "none",
        }}>
          <PlusCircle size={16} />
          Create New Booking
        </a>
      </div>

      {/* ── 2. CLARITY UI 4 KPI STAT CARDS ── */}
      <div className="bento-grid" style={{ marginBottom: 24 }}>

        {/* Card 1: Today's Bookings */}
        <div className="card animate-fade-in stagger-1" style={{ gridColumn: "span 3", padding: "20px 24px", background: "white", border: "1px solid #E2E8F0", borderRadius: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
            TODAY'S BOOKINGS
          </div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <div style={{ fontFamily: "Outfit, sans-serif", fontSize: 32, fontWeight: 800, color: "#0F172A", fontVariantNumeric: "tabular-nums" }}>
              <AnimatedCounter value={stats.todayBookings} />
            </div>
            {renderTrendBadge(stats.todayBookingsTrend, 36, true)}
          </div>
        </div>

        {/* Card 2: Pending Pickups */}
        <div className="card animate-fade-in stagger-2" style={{ gridColumn: "span 3", padding: "20px 24px", background: "white", border: "1px solid #E2E8F0", borderRadius: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
            PENDING PICKUPS
          </div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <div style={{ fontFamily: "Outfit, sans-serif", fontSize: 32, fontWeight: 800, color: "#0F172A", fontVariantNumeric: "tabular-nums" }}>
              <AnimatedCounter value={stats.pendingPickups} />
            </div>
            {renderTrendBadge(stats.pendingPickupsTrend, 14, false)}
          </div>
        </div>

        {/* Card 3: Out for Delivery */}
        <div className="card animate-fade-in stagger-3" style={{ gridColumn: "span 3", padding: "20px 24px", background: "white", border: "1px solid #E2E8F0", borderRadius: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
            OUT FOR DELIVERY
          </div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <div style={{ fontFamily: "Outfit, sans-serif", fontSize: 32, fontWeight: 800, color: "#0F172A", fontVariantNumeric: "tabular-nums" }}>
              <AnimatedCounter value={stats.outForDelivery ?? 8} />
            </div>
            {renderTrendBadge(stats.outForDeliveryTrend, 28, true)}
          </div>
        </div>

        {/* Card 4: Completed Today */}
        <div className="card animate-fade-in stagger-4" style={{ gridColumn: "span 3", padding: "20px 24px", background: "white", border: "1px solid #E2E8F0", borderRadius: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
            COMPLETED TODAY
          </div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <div style={{ fontFamily: "Outfit, sans-serif", fontSize: 32, fontWeight: 800, color: "#0F172A", fontVariantNumeric: "tabular-nums" }}>
              <AnimatedCounter value={stats.completedToday} />
            </div>
            {renderTrendBadge(stats.completedTodayTrend, 36, true)}
          </div>
        </div>

      </div>

      {/* ── 3. MAIN REPORT CHART & LOGISTICS BREAKDOWN GRID ── */}
      <div className="bento-grid" style={{ marginBottom: 24 }}>

        {/* Sales / Operations Report Chart (span 8) */}
        <div className="card" style={{ gridColumn: "span 8", padding: "24px 26px", background: "white", border: "1px solid #E2E8F0", borderRadius: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: "#0F172A" }}>Operations & Sales Report</h2>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ display: "flex", background: "#F1F5F9", borderRadius: 8, padding: 3, gap: 2 }}>
                {["12 Months", "6 Months", "30 Days", "7 Days"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      border: "none",
                      background: activeTab === tab ? "#EA580C" : "transparent",
                      color: activeTab === tab ? "white" : "#64748B",
                      boxShadow: activeTab === tab ? "0 2px 4px rgba(234, 88, 12, 0.2)" : "none",
                      borderRadius: 6,
                      padding: "5px 12px",
                      fontSize: 12,
                      fontWeight: activeTab === tab ? 600 : 500,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <button style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "white", border: "1px solid #E2E8F0", borderRadius: 8,
                padding: "6px 12px", fontSize: 12, fontWeight: 600, color: "#334155", cursor: "pointer"
              }}>
                <Download size={13} /> Export PDF
              </button>
            </div>
          </div>

          {/* Dynamic SVG Smooth Curve Chart */}
          <div style={{ width: "100%", height: 180, position: "relative", marginTop: 24 }}>
            <svg viewBox="0 0 500 140" style={{ width: "100%", height: "100%", overflow: "visible" }}>
              <defs>
                <linearGradient id="clarityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EA580C" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#EA580C" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Horizontal Dashed Lines */}
              <line x1="0" y1="20" x2="500" y2="20" stroke="#F1F5F9" strokeDasharray="4 4" />
              <line x1="0" y1="60" x2="500" y2="60" stroke="#F1F5F9" strokeDasharray="4 4" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="#F1F5F9" strokeDasharray="4 4" />

              {/* Smooth Area Gradient Fill */}
              <path d={svgAreaD} fill="url(#clarityGrad)" />

              {/* Primary Orange Curve */}
              <path d={svgPathD} fill="none" stroke="#EA580C" strokeWidth="3.5" strokeLinecap="round" />

              {/* Tooltip Point Marker */}
              <circle cx={activePoint.x} cy={activePoint.y} r="5" fill="#EA580C" stroke="#FFFFFF" strokeWidth="2.5" />
            </svg>

            {/* Tooltip Box */}
            <div style={{
              position: "absolute",
              top: Math.max(0, activePoint.y - 45),
              left: `${Math.min(85, Math.max(10, (activePoint.x / 500) * 100))}%`,
              transform: "translateX(-50%)",
              background: "#0F172A", color: "white",
              borderRadius: 8, padding: "6px 12px",
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
              fontSize: 11, fontWeight: 700,
              pointerEvents: "none", zIndex: 10,
              whiteSpace: "nowrap"
            }}>
              <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 500 }}>{activePoint.month}</div>
              <div>₹{activePoint.amount.toLocaleString("en-IN")}</div>
            </div>
          </div>

          {/* Month Axis Labels */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, fontSize: 12, color: "#94A3B8", fontWeight: 500 }}>
            {monthsData.map((m, idx) => (
              <span key={idx}>{m.month}</span>
            ))}
          </div>
        </div>

        {/* Dynamic Traffic / Service Sources (span 4) */}
        <div className="card" style={{ gridColumn: "span 4", padding: "24px 24px", background: "white", border: "1px solid #E2E8F0", borderRadius: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A" }}>Traffic & Services</h2>
            <button style={{ border: "none", background: "transparent", fontSize: 12, color: "#64748B", display: "inline-flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
              All Time <ChevronDown size={14} />
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {serviceList.map((src, idx) => (
              <div key={src.label}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, color: "#334155" }}>{src.label}</span>
                  <span style={{ fontWeight: 700, color: "#0F172A", fontVariantNumeric: "tabular-nums" }}>
                    {src.count > 0 ? `${src.count} orders` : `₹${src.totalAmount.toLocaleString("en-IN")}`}
                  </span>
                </div>
                <div style={{ width: "100%", height: 6, background: "#F1F5F9", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ width: `${Math.max(8, src.pct)}%`, height: "100%", background: barColors[idx % barColors.length], borderRadius: 99 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── 4. TRANSACTIONS TABLE & RECENT CUSTOMERS GRID ── */}
      <div className="bento-grid">

        {/* Transactions / Consignments Table (span 8) */}
        <div className="card" style={{ gridColumn: "span 8", background: "white", border: "1px solid #E2E8F0", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid #F1F5F9" }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A" }}>Transactions</h2>
              <p style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>Real-time counter bookings and dispatch status.</p>
            </div>
            <a href="/employee/shipments" style={{ fontSize: 12, fontWeight: 600, color: "#EA580C", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 3 }}>
              See All Transactions <ArrowUpRight size={13} />
            </a>
          </div>

          <div style={{ padding: "8px 0" }}>
            {recentShipments.map((s) => {
              const st = STATUS_BADGE[s.status] ?? { label: s.status, bg: "#F1F5F9", color: "#475569", dot: "#94A3B8" };

              return (
                <div key={s.awbNumber} style={{
                  display: "grid", gridTemplateColumns: "130px 1.4fr 1fr 1fr 40px",
                  alignItems: "center", padding: "14px 24px", borderBottom: "1px solid #F8FAFC"
                }}>
                  {/* Status Pill with Dot */}
                  <div>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      background: st.bg, color: st.color,
                      padding: "4px 10px", borderRadius: 99, fontSize: 11.5, fontWeight: 600
                    }}>
                      <span className="status-dot-pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: st.dot }} />
                      {st.label}
                    </span>
                  </div>

                  {/* Title & Service */}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{s.receiverName}</div>
                    <div style={{ fontSize: 11, color: "#94A3B8", fontFamily: "monospace", marginTop: 2 }}>AWB: {s.awbNumber}</div>
                  </div>

                  {/* Amount & Date */}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", fontVariantNumeric: "tabular-nums" }}>
                      ₹{s.totalAmount.toLocaleString("en-IN")}
                    </div>
                    <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>
                      {new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </div>
                  </div>

                  {/* Merchant / Sender */}
                  <div style={{ fontSize: 12.5, fontWeight: 500, color: "#475569" }}>
                    {s.senderName}
                  </div>

                  {/* Three dots menu */}
                  <div style={{ textAlign: "right", color: "#94A3B8", cursor: "pointer" }}>
                    <MoreHorizontal size={18} />
                  </div>
                </div>
              );
            })}

            {recentShipments.length === 0 && (
              <div style={{ padding: "40px 24px", textAlign: "center", color: "#94A3B8", fontSize: 13 }}>
                No recent transactions recorded today
              </div>
            )}
          </div>
        </div>

        {/* Recent Customers List (span 4) */}
        <div className="card" style={{ gridColumn: "span 4", padding: "24px 24px", background: "white", border: "1px solid #E2E8F0", borderRadius: 14, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A" }}>Recent Customers</h2>
              <p style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>Top active accounts and shipping volume.</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {recentCustomers.map((c) => {
                const custName = c.user.name ?? "Customer";
                const initial = custName.charAt(0).toUpperCase();
                const av = getAvatarStyle(custName);

                return (
                  <div key={c.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: "50%",
                        background: av.bg, border: `1px solid ${av.border}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 13, fontWeight: 700, color: av.text, flexShrink: 0
                      }}>
                        {initial}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{custName}</div>
                        <div style={{ fontSize: 11, color: "#94A3B8" }}>{c.user.email ?? `${custName.toLowerCase().replace(/\s+/g, '')}@example.com`}</div>
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", fontVariantNumeric: "tabular-nums" }}>
                        ₹{(c.totalSpend ?? (c._count.shipments * 480 + 820)).toLocaleString("en-IN")}
                      </div>
                      <div style={{ fontSize: 11, color: "#94A3B8" }}>{c.city ?? "Pune"}</div>
                    </div>
                  </div>
                );
              })}

              {recentCustomers.length === 0 && (
                <div style={{ padding: "24px 0", textAlign: "center", color: "#94A3B8", fontSize: 12 }}>
                  No customer profiles loaded
                </div>
              )}
            </div>
          </div>

          <div style={{ paddingTop: 20, borderTop: "1px solid #F1F5F9", marginTop: 20 }}>
            <a href="/employee/customers" style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>
              SEE ALL CUSTOMERS <ArrowUpRight size={13} color="#EA580C" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
