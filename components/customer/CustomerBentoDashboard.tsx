"use client";

import {
  Package, MapPin, Clock, Receipt, ArrowUpRight, PlusCircle, Search,
  CheckCircle2, Truck, AlertTriangle, TrendingUp, PackageSearch, Star, Zap
} from "lucide-react";
import { AnimatedCounter } from "@/components/AnimatedCounter";

const STATUS_BADGE: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  BOOKED:           { label: "Booked",          bg: "#EFF6FF", color: "#1D4ED8", dot: "#3B82F6" },
  AWAITING_PICKUP:  { label: "Awaiting Pickup", bg: "#FFFBEB", color: "#B45309", dot: "#F59E0B" },
  COLLECTED:        { label: "Collected",       bg: "#EFF6FF", color: "#1D4ED8", dot: "#3B82F6" },
  ORIGIN_HUB:       { label: "At Origin Hub",   bg: "#F5F3FF", color: "#6D28D9", dot: "#8B5CF6" },
  REGIONAL_HUB:     { label: "Regional Hub",    bg: "#F5F3FF", color: "#6D28D9", dot: "#8B5CF6" },
  SORTING_CENTER:   { label: "Sorting Center",  bg: "#FFFBEB", color: "#B45309", dot: "#F59E0B" },
  DESTINATION_HUB:  { label: "Dest. Hub",       bg: "#FFFBEB", color: "#B45309", dot: "#F59E0B" },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", bg: "#EFF6FF", color: "#1D4ED8", dot: "#3B82F6" },
  DELIVERED:        { label: "Delivered",       bg: "#DCFCE7", color: "#15803D", dot: "#22C55E" },
  CANCELLED:        { label: "Cancelled",       bg: "#FEF2F2", color: "#B91C1C", dot: "#EF4444" },
  RTO:              { label: "Returned",        bg: "#FEF2F2", color: "#B91C1C", dot: "#EF4444" },
};

interface Shipment {
  awbNumber: string;
  receiverName: string;
  receiverCity: string;
  receiverState: string;
  status: string;
  serviceType: string;
  totalAmount: number;
  createdAt: Date;
  expectedDelivery: Date | null;
}

interface SavedAddress {
  id: string;
  label: string;
  name: string;
  city: string;
  address: string;
}

interface Props {
  userName?: string | null;
  stats: {
    activeShipments: number;
    deliveredCount: number;
    totalSpend: number;
  };
  recentShipments: Shipment[];
  savedAddresses: SavedAddress[];
}

export function CustomerBentoDashboard({
  userName, stats, recentShipments, savedAddresses,
}: Props) {
  return (
    <div className="page-container" style={{ paddingTop: 28, paddingBottom: 40 }}>

      {/* Header & Display Typography */}
      <div style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontFamily: "Outfit, sans-serif", fontSize: 26, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            Hello, {userName?.split(" ")[0] ?? "there"} 👋
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 3 }}>
            Manage active shipments, track consignments, and view account history.
          </p>
        </div>
        <a href="/customer/book" className="btn btn-primary" style={{ gap: 6, height: 40, padding: "0 18px" }}>
          <PlusCircle size={15} />
          Book Shipment
        </a>
      </div>

      {/* Operational Bento Grid (No Marketing Fluff) */}
      <div className="bento-grid" style={{ marginBottom: 24 }}>

        {/* Hero Metric: Total Spent (Green = Finance & Money) */}
        <div
          className="card card-hover"
          style={{
            gridColumn: "span 6",
            padding: "22px 26px",
            background: "white",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, background: "#F0FDF4", border: "1px solid #DCFCE7", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Receipt size={14} color="#16A34A" />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Total Account Spend
              </span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#166534", background: "#F0FDF4", border: "1px solid #DCFCE7", padding: "2px 8px", borderRadius: 99, display: "flex", alignItems: "center", gap: 4 }}>
              <TrendingUp size={11} /> +14.2% this month
            </span>
          </div>
          <div style={{ fontFamily: "Outfit, sans-serif", fontSize: 40, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums", marginBottom: 6 }}>
            ₹<AnimatedCounter value={stats.totalSpend} />
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Lifetime logistics expenditure across all bookings
          </div>
        </div>

        {/* Active Shipments (Blue = Shipments) */}
        <div className="card card-hover" style={{ gridColumn: "span 3", padding: "22px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
                Active Shipments
              </div>
              <div style={{ fontFamily: "Outfit, sans-serif", fontSize: 34, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                <AnimatedCounter value={stats.activeShipments} />
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>In transit right now</div>
            </div>
            <div style={{ width: 40, height: 40, background: "#EFF6FF", border: "1px solid #DBEAFE", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Package size={18} color="#2563EB" />
            </div>
          </div>
        </div>

        {/* Total Delivered (Green = Completed Success) */}
        <div className="card card-hover" style={{ gridColumn: "span 3", padding: "22px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
                Total Delivered
              </div>
              <div style={{ fontFamily: "Outfit, sans-serif", fontSize: 34, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                <AnimatedCounter value={stats.deliveredCount} />
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>All time completed</div>
            </div>
            <div style={{ width: 40, height: 40, background: "#F0FDF4", border: "1px solid #DCFCE7", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <MapPin size={18} color="#16A34A" />
            </div>
          </div>
        </div>

        {/* Strict 4-Color Tied Shortcuts Row (Red CTA, Blue Logistics, Amber History, Green Receipts) */}
        <div className="card" style={{ gridColumn: "span 12", padding: "14px 20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", alignItems: "center" }}>
            {[
              { label: "Book Parcel", href: "/customer/book", icon: PlusCircle, desc: "Schedule a new shipment", bg: "#E31E24" },
              { label: "Track Consignment", href: "/customer/track", icon: Search, desc: "Check live AWB status", bg: "#2563EB" },
              { label: "Shipment History", href: "/customer/history", icon: Clock, desc: "View all past bookings", bg: "#D97706" },
              { label: "Invoices & Receipts", href: "/customer/invoices", icon: Receipt, desc: "Download PDF statements", bg: "#16A34A" },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 14px",
                    borderRadius: 8,
                    textDecoration: "none",
                    borderRight: idx < 3 ? "1px solid var(--border-subtle)" : "none",
                    transition: "background 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-subtle)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{
                    width: 34, height: 34,
                    background: item.bg,
                    border: "none",
                    borderRadius: 8,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <Icon size={16} color="#FFFFFF" />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.2 }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{item.desc}</div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        {/* Recent Shipments Table (span 8) */}
        <div className="card" style={{ gridColumn: "span 8", display: "flex", flexDirection: "column", justifyContent: "space-between", overflow: "hidden" }}>
          <div>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--border)", background: "white" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: "var(--bg-muted)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Clock size={14} color="var(--text-secondary)" />
                </div>
                <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
                  Recent Consignments
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", background: "var(--bg-muted)", border: "1px solid var(--border)", padding: "1px 7px", borderRadius: 99 }}>
                  {recentShipments.length}
                </span>
              </div>
              <a href="/customer/history" className="btn btn-ghost btn-sm" style={{ gap: 4, fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>
                View history <ArrowUpRight size={13} />
              </a>
            </div>

            {recentShipments.length > 0 ? (
              <div className="table-container" style={{ border: "none", borderRadius: 0 }}>
                <table className="data-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#FAFAFA", borderBottom: "1px solid var(--border)" }}>
                      <th style={{ padding: "11px 18px", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>AWB Number</th>
                      <th style={{ padding: "11px 18px", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Receiver</th>
                      <th style={{ padding: "11px 18px", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Destination</th>
                      <th style={{ padding: "11px 18px", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Status</th>
                      <th style={{ padding: "11px 18px", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Amount</th>
                      <th style={{ padding: "11px 18px", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "right" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentShipments.map((s) => {
                      const st = STATUS_BADGE[s.status] ?? { label: s.status, bg: "#F1F5F9", color: "#475569", dot: "#94A3B8" };
                      const formattedCity = s.receiverCity
                        ? s.receiverCity.charAt(0).toUpperCase() + s.receiverCity.slice(1).toLowerCase()
                        : "N/A";
                      const initial = s.receiverName ? s.receiverName.charAt(0).toUpperCase() : "R";

                      return (
                        <tr key={s.awbNumber} style={{ borderBottom: "1px solid var(--border-subtle)", transition: "background 0.15s ease" }}>
                          {/* AWB Code */}
                          <td style={{ padding: "13px 18px" }}>
                            <span style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: 12,
                              fontWeight: 700,
                              color: "var(--text-primary)",
                              background: "var(--bg-muted)",
                              border: "1px solid var(--border)",
                              padding: "3px 8px",
                              borderRadius: 6,
                              letterSpacing: "0.02em",
                            }}>
                              {s.awbNumber}
                            </span>
                          </td>

                          {/* Receiver with Initial Avatar */}
                          <td style={{ padding: "13px 18px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{
                                width: 26,
                                height: 26,
                                borderRadius: "50%",
                                background: "var(--bg-muted)",
                                border: "1px solid var(--border)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 11,
                                fontWeight: 700,
                                color: "var(--text-secondary)",
                                flexShrink: 0,
                              }}>
                                {initial}
                              </div>
                              <span style={{ fontWeight: 600, fontSize: 13.5, color: "var(--text-primary)" }}>
                                {s.receiverName}
                              </span>
                            </div>
                          </td>

                          {/* Destination with Map Pin */}
                          <td style={{ padding: "13px 18px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--text-secondary)", fontSize: 13, fontWeight: 500 }}>
                              <MapPin size={13} color="var(--text-muted)" />
                              {formattedCity}
                            </div>
                          </td>

                          {/* Status Badge */}
                          <td style={{ padding: "13px 18px" }}>
                            <span style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "3px 9px",
                              borderRadius: 99,
                              fontSize: 11.5,
                              fontWeight: 600,
                              background: st.bg,
                              color: st.color,
                            }}>
                              <span style={{ width: 6, height: 6, borderRadius: "50%", background: st.dot }} />
                              {st.label}
                            </span>
                          </td>

                          {/* Amount */}
                          <td style={{ padding: "13px 18px", fontWeight: 700, fontSize: 13.5, color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>
                            ₹{s.totalAmount.toLocaleString("en-IN")}
                          </td>

                          {/* Action Button */}
                          <td style={{ padding: "13px 18px", textAlign: "right" }}>
                            <a
                              href={`/customer/track?awb=${s.awbNumber}`}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: 11.5, padding: "4px 12px", height: 28, fontWeight: 600, borderRadius: 6, gap: 4 }}
                            >
                              Track <ArrowUpRight size={12} />
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: "48px 24px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--bg-muted)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <PackageSearch size={22} color="var(--text-muted)" />
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>No shipments booked yet</p>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>Book your first parcel consignment to start tracking AWBs in real time.</p>
                </div>
              </div>
            )}
          </div>

          {/* Table Card Footer */}
          <div style={{
            padding: "11px 20px",
            background: "#FAFAFA",
            borderTop: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justify: "space-between",
            fontSize: 12,
            color: "var(--text-muted)",
          }}>
            <span style={{ fontWeight: 500 }}>Showing {recentShipments.length} recent consignments</span>
            <a href="/customer/history" style={{ color: "var(--text-primary)", fontWeight: 600, textDecoration: "none", fontSize: 12 }}>
              View full ledger →
            </a>
          </div>
        </div>

        {/* Saved Addresses (span 4) */}
        <div className="card" style={{ gridColumn: "span 4", padding: "20px 22px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <MapPin size={15} color="var(--text-muted)" />
              <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>Saved Addresses</span>
            </div>
            <a href="/customer/addresses" className="btn btn-ghost btn-sm" style={{ fontSize: 12, fontWeight: 600 }}>Manage</a>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {savedAddresses.map((addr) => (
              <div key={addr.id} style={{ padding: "10px 12px", borderRadius: 8, background: "var(--bg-subtle)", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--brand-red)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{addr.label}</span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{addr.city}</span>
                </div>
                <div style={{ fontSize: 12.5, color: "var(--text-primary)", fontWeight: 600 }}>{addr.name}</div>
                <div style={{ fontSize: 11.5, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>{addr.address}</div>
              </div>
            ))}
            {savedAddresses.length === 0 && (
              <div style={{ padding: "24px 0", textAlign: "center", color: "var(--text-muted)", fontSize: 12 }}>
                No saved addresses yet
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
