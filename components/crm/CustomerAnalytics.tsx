"use client";

import { Users, UserCheck, Clock, TrendingUp, Award, MapPin } from "lucide-react";
import { AnimatedCounter } from "@/components/AnimatedCounter";

interface Props {
  analytics: {
    totalCustomers: number;
    newThisMonth: number;
    repeatCustomerPct: number;
    corporatePct: number;
    categoryCounts: any[];
    topAccounts: any[];
  };
}

export function CustomerAnalytics({ analytics }: Props) {
  return (
    <div>
      {/* ── 1. EXECUTIVE CRM INTEL KPIS ── */}
      <div className="bento-grid" style={{ marginBottom: 24 }}>
        <div className="card" style={{ gridColumn: "span 3", padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>TOTAL CUSTOMERS</span>
            <Users size={20} color="var(--brand-red)" />
          </div>
          <div style={{ fontFamily: "Outfit, sans-serif", fontSize: 28, fontWeight: 800, marginTop: 8 }}>
            <AnimatedCounter value={analytics.totalCustomers} />
          </div>
          <span style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 4, display: "block" }}>
            Active franchise accounts
          </span>
        </div>

        <div className="card" style={{ gridColumn: "span 3", padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>NEW THIS MONTH</span>
            <TrendingUp size={20} color="#16A34A" />
          </div>
          <div style={{ fontFamily: "Outfit, sans-serif", fontSize: 28, fontWeight: 800, color: "#16A34A", marginTop: 8 }}>
            +<AnimatedCounter value={analytics.newThisMonth} />
          </div>
          <span style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 4, display: "block" }}>
            Acquired this calendar month
          </span>
        </div>

        <div className="card" style={{ gridColumn: "span 3", padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>REPEAT RETENTION RATE</span>
            <UserCheck size={20} color="#2563EB" />
          </div>
          <div style={{ fontFamily: "Outfit, sans-serif", fontSize: 28, fontWeight: 800, color: "#2563EB", marginTop: 8 }}>
            {analytics.repeatCustomerPct}%
          </div>
          <span style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 4, display: "block" }}>
            2+ parcel bookings retention
          </span>
        </div>

        <div className="card" style={{ gridColumn: "span 3", padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>CORPORATE ACCOUNTS</span>
            <Award size={20} color="#7C3AED" />
          </div>
          <div style={{ fontFamily: "Outfit, sans-serif", fontSize: 28, fontWeight: 800, color: "#7C3AED", marginTop: 8 }}>
            {analytics.corporatePct}%
          </div>
          <span style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 4, display: "block" }}>
            High volume business accounts
          </span>
        </div>
      </div>

      {/* ── 2. TOP 10 ACCOUNTS & RETENTION COHORTS ── */}
      <div className="bento-grid">
        {/* Top 10 Revenue Accounts */}
        <div className="card" style={{ gridColumn: "span 6", padding: 22 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Top 10 Revenue Generating Accounts</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {analytics.topAccounts.map((acc, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "var(--bg-subtle)", borderRadius: 8, fontSize: 12.5 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontWeight: 800, color: "var(--brand-red)", width: 20 }}>#{idx + 1}</span>
                  <span style={{ fontWeight: 700 }}>{acc.name}</span>
                </div>
                <div style={{ display: "flex", gap: 16 }}>
                  <span style={{ color: "var(--text-muted)" }}>{acc.shipments} AWBs</span>
                  <span style={{ fontWeight: 800, fontFamily: "monospace" }}>₹{acc.revenue.toLocaleString("en-IN")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Account Category Segmentation */}
        <div className="card" style={{ gridColumn: "span 6", padding: 22 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Account Segmentation & Dormant Metric</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {analytics.categoryCounts.map((cat, idx) => (
              <div key={idx} style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{cat.category} ACCOUNTS</span>
                  <span className="badge badge-blue">{cat.count} Accounts</span>
                </div>
              </div>
            ))}

            <div style={{ padding: 14, background: "#FEF3C7", borderRadius: 8, border: "1px solid #F59E0B" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#92400E", fontWeight: 700, fontSize: 13 }}>
                <Clock size={16} /> Dormant Account Detection (90+ Days Inactive)
              </div>
              <p style={{ fontSize: 12, color: "#B45309", marginTop: 4, margin: 0 }}>
                2 accounts have not booked a shipment in over 90 days. Recommended action: Send WhatsApp re-engagement offer.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
