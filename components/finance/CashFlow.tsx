"use client";

import { useState, useEffect } from "react";

export function CashFlow() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/finance/reports")
      .then((r) => r.json())
      .then((d) => { setData(d.cashFlow); setLoading(false); });
  }, []);

  if (loading || !data) {
    return <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>Loading cash flow…</div>;
  }

  const isPositive = data.netFlow >= 0;

  const rows = [
    {
      label: "Counter Inflows",
      sub: "Bookings & COD receipts collected",
      value: data.collections,
      sign: "+",
      valueColor: "#15803D",
    },
    {
      label: "Operating Outflows",
      sub: "Overheads & stationery disbursements",
      value: data.expenses,
      sign: "-",
      valueColor: "#B91C1C",
    },
    {
      label: "Bank Deposits",
      sub: "Cash transferred to corporate account",
      value: data.bankDeposits,
      sign: "-",
      valueColor: "var(--text-primary)",
    },
  ];

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
        <p style={{ fontSize: 10.5, fontWeight: 500, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 5, lineHeight: 1 }}>
          Statement
        </p>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.015em", lineHeight: 1 }}>Cash Flow Summary</h3>
        <p style={{ fontSize: 12, fontWeight: 400, color: "var(--text-muted)", marginTop: 6, lineHeight: 1.5 }}>
          Physical drawer · Expense outflows · Bank transfers
        </p>
      </div>

      <div style={{ padding: "8px 24px 24px" }}>
        {rows.map((r, i) => (
          <div key={i} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "14px 0",
            borderBottom: "1px solid var(--border-subtle)",
          }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", letterSpacing: "-0.005em", marginBottom: 3 }}>{r.label}</p>
              <p style={{ fontSize: 11.5, fontWeight: 400, color: "var(--text-muted)", lineHeight: 1.4 }}>{r.sub}</p>
            </div>
            <span style={{
              fontSize: 14, fontWeight: 600,
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "-0.01em",
              color: r.valueColor,
            }}>
              {r.sign}₹{r.value.toLocaleString("en-IN")}
            </span>
          </div>
        ))}

        {/* Net cash flow */}
        <div style={{
          marginTop: 16,
          padding: "16px 18px",
          background: isPositive ? "#F0FDF4" : "#FEF2F2",
          border: `1px solid ${isPositive ? "#A7F3D0" : "#FCA5A5"}`,
          borderRadius: 8,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 500, color: isPositive ? "#15803D" : "#B91C1C", textTransform: "uppercase", letterSpacing: "0.09em", lineHeight: 1 }}>
              Net Monthly Cash Flow
            </p>
            <p style={{ fontSize: 12, fontWeight: 400, color: isPositive ? "#166534" : "#991B1B", marginTop: 5, opacity: 0.75, lineHeight: 1.4 }}>
              {isPositive ? "Cash position is healthy this month" : "Outflows exceed inflows this month"}
            </p>
          </div>
          <p style={{
            fontSize: 26, fontWeight: 600,
            fontFamily: "Outfit, sans-serif",
            letterSpacing: "-0.03em",
            lineHeight: 1,
            color: isPositive ? "#15803D" : "#B91C1C",
          }}>
            {isPositive ? "+" : "−"}₹{Math.abs(data.netFlow).toLocaleString("en-IN")}
          </p>
        </div>
      </div>
    </div>
  );
}
