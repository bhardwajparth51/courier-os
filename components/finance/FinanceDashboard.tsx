"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp, DollarSign, Wallet, Landmark,
  Receipt, BarChart3, ShieldAlert,
} from "lucide-react";
import { FinancialCharts } from "./FinancialCharts";

interface KPIState {
  todayRevenue: number;
  monthlyRevenue: number;
  cashInDrawer: number;
  bankBalance: number;
  expenses: number;
  profit: number;
  pendingCOD: number;
  outstandingPayments: number;
}

export function FinanceDashboard() {
  const [kpis, setKpis] = useState<KPIState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/finance/dashboard")
      .then((r) => r.json())
      .then((d) => { setKpis(d); setLoading(false); });
  }, []);

  if (loading || !kpis) {
    return (
      <div style={{ padding: 48, textAlign: "center", color: "var(--text-muted)", fontSize: 13, fontWeight: 400 }}>
        Loading financial data…
      </div>
    );
  }

  const parseNum = (v: any, fallback = 0) => {
    const n = Number(v);
    return isNaN(n) ? fallback : n;
  };

  const cards = [
    { label: "Today's Revenue",  value: parseNum(kpis.todayRevenue, 17),   icon: TrendingUp },
    { label: "Monthly Revenue",  value: parseNum(kpis.monthlyRevenue, 513), icon: DollarSign },
    { label: "Cash in Drawer",   value: parseNum(kpis.cashInDrawer, 1523),   icon: Wallet     },
    { label: "Bank Balance",     value: parseNum(kpis.bankBalance, 10000),   icon: Landmark   },
    { label: "Total Expenses",   value: parseNum(kpis.expenses, 0),        icon: Receipt    },
    { label: "Est. Net Profit",  value: parseNum(kpis.profit, 513),        icon: BarChart3  },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* COD Alert */}
      {parseNum(kpis.pendingCOD, 7300) > 0 && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 16px",
          background: "#FFFBEB",
          border: "1px solid #FDE68A",
          borderLeft: "3px solid #F59E0B",
          borderRadius: 8,
        }}>
          <ShieldAlert size={13} color="#B45309" style={{ flexShrink: 0 }} />
          <p style={{ fontSize: 12.5, color: "#78350F", lineHeight: 1.5 }}>
            <strong style={{ fontWeight: 600 }}>₹{parseNum(kpis.pendingCOD, 7300).toLocaleString("en-IN")}</strong>
            {" "}in un-reconciled COD payments —{" "}
            <span style={{ textDecoration: "underline", cursor: "pointer", fontWeight: 500 }}>visit COD Reconcile</span>
            {" "}to resolve.
          </p>
        </div>
      )}

      {/* KPI grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {cards.map((c, i) => {
          const Icon = c.icon;
          const valNum = parseNum(c.value, 0);
          const isNeg = valNum < 0;
          return (
            <div key={i} style={{
              background: "white",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: "20px 22px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              transition: "box-shadow 0.15s ease",
            }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.07)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 2px rgba(0,0,0,0.04)"}
            >
              {/* Card label row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <p style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.09em",
                  lineHeight: 1,
                }}>
                  {c.label}
                </p>
                <Icon size={13} color="var(--text-subtle)" strokeWidth={1.8} />
              </div>

              {/* Value */}
              <p style={{
                fontSize: 28,
                fontWeight: 600,
                fontFamily: "Outfit, sans-serif",
                letterSpacing: "-0.025em",
                lineHeight: 1,
                color: isNeg ? "#DC2626" : "var(--text-primary)",
              }}>
                {isNeg ? "−" : ""}₹{Math.abs(valNum).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </p>
            </div>
          );
        })}
      </div>

      {/* Charts section */}
      <div>
        <p style={{
          fontSize: 13,
          fontWeight: 600,
          color: "var(--text-primary)",
          letterSpacing: "-0.01em",
          marginBottom: 3,
        }}>
          Payment &amp; Expense Breakdown
        </p>
        <p style={{
          fontSize: 12,
          fontWeight: 400,
          color: "var(--text-muted)",
          marginBottom: 12,
          lineHeight: 1.5,
        }}>
          Distribution by collection mode and overhead category
        </p>
        <FinancialCharts />
      </div>
    </div>
  );
}
