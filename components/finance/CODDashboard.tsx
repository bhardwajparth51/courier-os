"use client";

import { useState, useEffect } from "react";
import { SettlementTable } from "./SettlementTable";

export function CODDashboard() {
  const [settlements, setSettlements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

  const fetchSettlements = async () => {
    const res = await fetch("/api/finance/cod");
    const data = await res.json();
    setSettlements(data.settlements || []);
    setLoading(false);
  };

  useEffect(() => { fetchSettlements(); }, []);

  if (loading) return <div style={{ padding: 48, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>Loading COD ledger…</div>;

  const totalCOD    = settlements.reduce((acc, s) => acc + s.amount, 0);
  const pendingCOD  = settlements.filter((s) => s.status !== "SETTLED").reduce((acc, s) => acc + s.amount, 0);
  const settledCOD  = settlements.filter((s) => s.status === "SETTLED").reduce((acc, s) => acc + s.amount, 0);
  const pendingCount = settlements.filter((s) => s.status !== "SETTLED").length;
  const settlePct   = totalCOD > 0 ? Math.round((settledCOD / totalCOD) * 100) : 0;

  const handleSimulate = async () => {
    setSimulating(true);
    await fetch("/api/finance/cod", { method: "POST" });
    await fetchSettlements();
    setSimulating(false);
  };

  const metrics = [
    { label: "Total COD Handled",      value: totalCOD,    valueColor: "var(--text-primary)", sub: `${settlements.length} shipments` },
    { label: "Pending Collection",      value: pendingCOD,  valueColor: "#B45309",             sub: `${pendingCount} awaiting handover` },
    { label: "Settled to Branch",       value: settledCOD,  valueColor: "#15803D",             sub: "Fully reconciled" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Page title row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
            COD Reconciliation Ledger
          </h3>
          <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 3 }}>
            Track driver handovers, cash collections, and branch settlements
          </p>
        </div>
        <button
          onClick={handleSimulate}
          disabled={simulating}
          style={{
            background: "white",
            border: "1px solid var(--border)",
            borderRadius: 7, padding: "8px 14px",
            fontSize: 12.5, fontWeight: 600,
            cursor: simulating ? "not-allowed" : "pointer",
            color: simulating ? "var(--text-muted)" : "var(--text-primary)",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          }}
        >
          {simulating ? "Generating…" : "Simulate COD Delivery"}
        </button>
      </div>

      {/* Metric cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {metrics.map((m, i) => (
          <div key={i} style={{
            background: "white",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "18px 20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>
              {m.label}
            </p>
            <p style={{ fontSize: 22, fontWeight: 700, fontFamily: "Outfit, sans-serif", color: m.valueColor, letterSpacing: "-0.01em" }}>
              ₹{m.value.toLocaleString("en-IN")}
            </p>
            <p style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 5 }}>{m.sub}</p>
          </div>
        ))}

        {/* Settlement rate card */}
        <div style={{
          background: "white",
          border: "1px solid var(--border)",
          borderRadius: 10,
          padding: "18px 20px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>
            Settlement Rate
          </p>
          <p style={{ fontSize: 22, fontWeight: 700, fontFamily: "Outfit, sans-serif", color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
            {settlePct}%
          </p>
          <div style={{ marginTop: 10, height: 4, background: "var(--bg-muted)", borderRadius: 99, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 99,
              width: `${settlePct}%`,
              background: "var(--brand-red)",
              transition: "width 0.6s ease",
            }} />
          </div>
          <p style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 6 }}>
            {settlePct === 100 ? "All reconciled" : `${100 - settlePct}% still pending`}
          </p>
        </div>
      </div>

      <SettlementTable settlements={settlements} onRefresh={fetchSettlements} />
    </div>
  );
}
