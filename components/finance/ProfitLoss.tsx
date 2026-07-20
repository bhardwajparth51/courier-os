"use client";

import { useState, useEffect } from "react";

export function ProfitLoss() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/finance/reports")
      .then((r) => r.json())
      .then((d) => { setData(d.profitLoss); setLoading(false); });
  }, []);

  if (loading || !data) {
    return <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>Generating P&L statement…</div>;
  }

  const isProfit = data.netProfit >= 0;

  return (
    <div style={{
      background: "white",
      border: "1px solid var(--border)",
      borderRadius: 10,
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      overflow: "hidden",
    }}>
      {/* Card header */}
      <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ fontSize: 10.5, fontWeight: 500, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 5, lineHeight: 1 }}>
              Financial Statement
            </p>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.015em", lineHeight: 1 }}>Profit &amp; Loss</h3>
          </div>
          <span style={{
            padding: "4px 10px", borderRadius: 6,
            fontSize: 11, fontWeight: 600, letterSpacing: "0.02em",
            background: isProfit ? "#ECFDF5" : "#FEF2F2",
            color: isProfit ? "#15803D" : "#B91C1C",
            border: `1px solid ${isProfit ? "#A7F3D0" : "#FCA5A5"}`,
          }}>
            {isProfit ? "▲ Profit" : "▼ Loss"}
          </span>
        </div>
        <p style={{ fontSize: 12, fontWeight: 400, color: "var(--text-muted)", marginTop: 6, lineHeight: 1.5 }}>Current fiscal calendar month</p>
      </div>

      <div style={{ padding: "4px 24px 24px" }}>
        {/* Revenue section */}
        <SectionLabel>1. Operational Revenues</SectionLabel>
        <LineRow label="Franchise Counter Bookings" value={data.revenue.bookingRevenue} />
        <LineRow label="Other Miscellaneous Income" value={data.revenue.otherIncome} />
        <SubtotalRow label="Gross Revenues (A)" value={data.revenue.total} color="#15803D" />

        {/* Expenses section */}
        <SectionLabel>2. Branch Overhead Expenses</SectionLabel>
        {Object.entries(data.expenses.breakdown).map(([cat, amt]: any) => (
          <LineRow
            key={cat}
            label={cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase().replace(/_/g, " ")}
            value={amt}
          />
        ))}
        {Object.keys(data.expenses.breakdown).length === 0 && (
          <p style={{ fontSize: 13, color: "var(--text-muted)", padding: "10px 0", fontStyle: "italic" }}>No expenses filed this month.</p>
        )}
        <SubtotalRow label="Total Expenses (B)" value={data.expenses.total} color="#B91C1C" />

        {/* Net profit */}
        <div style={{
          marginTop: 18,
          padding: "16px 20px",
          background: isProfit ? "#F0FDF4" : "#FEF2F2",
          border: `1px solid ${isProfit ? "#A7F3D0" : "#FCA5A5"}`,
          borderRadius: 8,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 500, color: isProfit ? "#15803D" : "#B91C1C", textTransform: "uppercase", letterSpacing: "0.09em", lineHeight: 1 }}>
              Net {isProfit ? "Profit" : "Loss"} (A – B)
            </p>
            <p style={{ fontSize: 12, fontWeight: 400, color: isProfit ? "#166534" : "#991B1B", marginTop: 5, opacity: 0.75, lineHeight: 1.4 }}>
              {isProfit ? "Branch is operating profitably this month" : "Operating at a loss this month"}
            </p>
          </div>
          <p style={{
            fontSize: 26, fontWeight: 600,
            fontFamily: "Outfit, sans-serif",
            letterSpacing: "-0.03em",
            lineHeight: 1,
            color: isProfit ? "#15803D" : "#B91C1C",
          }}>
            {isProfit ? "+" : "−"}₹{Math.abs(data.netProfit).toLocaleString("en-IN")}
          </p>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 10.5,
      fontWeight: 500,
      color: "var(--text-muted)",
      textTransform: "uppercase",
      letterSpacing: "0.09em",
      lineHeight: 1,
      padding: "16px 0 10px",
      borderBottom: "1px solid var(--border-subtle)",
      marginBottom: 2,
    }}>
      {children}
    </p>
  );
}

function LineRow({ label, value }: { label: string; value: number }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "9px 8px",
      borderBottom: "1px solid var(--border-subtle)",
    }}>
      <span style={{ fontSize: 13, fontWeight: 400, color: "var(--text-secondary)", letterSpacing: "-0.005em" }}>{label}</span>
      <span style={{
        fontSize: 13, fontWeight: 500,
        fontFamily: "'JetBrains Mono', monospace",
        color: "var(--text-primary)",
        letterSpacing: "-0.01em",
      }}>
        ₹{value.toLocaleString("en-IN")}
      </span>
    </div>
  );
}

function SubtotalRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "11px 8px",
      background: "#F9FAFB",
      borderBottom: "1px solid var(--border)",
      marginTop: 2,
    }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>{label}</span>
      <span style={{
        fontSize: 13.5, fontWeight: 600,
        fontFamily: "'JetBrains Mono', monospace",
        letterSpacing: "-0.01em",
        color,
      }}>
        ₹{value.toLocaleString("en-IN")}
      </span>
    </div>
  );
}
