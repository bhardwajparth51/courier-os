"use client";

import { CheckCircle2, ArrowRight } from "lucide-react";

interface Props {
  settlements: any[];
  onRefresh: () => void;
}

const STATUS_FLOW: Record<string, { next: string; label: string }> = {
  COLLECTED:       { next: "DRIVER_HOLDING",  label: "Mark Driver Holding" },
  DRIVER_HOLDING:  { next: "BRANCH_RECEIVED", label: "Received at Branch" },
  BRANCH_RECEIVED: { next: "SETTLED",         label: "Settle COD" },
};

const STATUS_LABELS: Record<string, string> = {
  COLLECTED:       "Collected",
  DRIVER_HOLDING:  "Driver Holding",
  BRANCH_RECEIVED: "Branch Received",
  SETTLED:         "Settled",
};

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  COLLECTED:       { bg: "#FEF3C7", color: "#92400E" },
  DRIVER_HOLDING:  { bg: "#FEF9C3", color: "#854D0E" },
  BRANCH_RECEIVED: { bg: "#DBEAFE", color: "#1D4ED8" },
  SETTLED:         { bg: "#DCFCE7", color: "#15803D" },
};

export function SettlementTable({ settlements, onRefresh }: Props) {
  const handleTransition = async (shipmentId: string, nextStatus: string) => {
    await fetch("/api/finance/cod", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shipmentId, status: nextStatus }),
    });
    onRefresh();
  };

  return (
    <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)" }}>
        <span style={{ fontSize: 13.5, fontWeight: 700 }}>COD Register</span>
        <span style={{ fontSize: 12.5, color: "var(--text-muted)", marginLeft: 8 }}>
          {settlements.length} shipment{settlements.length !== 1 ? "s" : ""}
        </span>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.06em", borderBottom: "1px solid var(--border-subtle)" }}>
            {["AWB Number", "Driver", "COD Amount", "Status", "Reconciled By", "Action"].map((h, i) => (
              <th key={h} style={{ padding: "9px 16px", textAlign: i === 2 ? "right" : i >= 4 ? "center" : "left", fontWeight: 600 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {settlements.map((s) => {
            const statusStyle = STATUS_COLORS[s.status] || { bg: "#F3F4F6", color: "#374151" };
            const transition = STATUS_FLOW[s.status];
            return (
              <tr key={s.id} style={{ borderBottom: "1px solid var(--border-subtle)", fontSize: 13 }}>
                <td style={{ padding: "11px 16px", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 12.5 }}>
                  {s.shipmentId}
                </td>
                <td style={{ padding: "11px 16px", color: "var(--text-secondary)" }}>
                  {s.driverId || <span style={{ color: "var(--text-subtle)", fontStyle: "italic" }}>Unassigned</span>}
                </td>
                <td style={{ padding: "11px 16px", textAlign: "right", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
                  ₹{s.amount.toLocaleString("en-IN")}
                </td>
                <td style={{ padding: "11px 16px" }}>
                  <span style={{
                    display: "inline-block", padding: "3px 9px", borderRadius: 5,
                    fontSize: 11.5, fontWeight: 600,
                    background: statusStyle.bg, color: statusStyle.color,
                  }}>
                    {STATUS_LABELS[s.status] || s.status}
                  </span>
                </td>
                <td style={{ padding: "11px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: 12.5 }}>
                  {s.reconciledBy || "—"}
                </td>
                <td style={{ padding: "11px 16px", textAlign: "center" }}>
                  {transition ? (
                    <button
                      onClick={() => handleTransition(s.shipmentId, transition.next)}
                      style={{
                        background: "white", border: "1px solid var(--border)",
                        borderRadius: 6, padding: "5px 10px",
                        fontSize: 12, fontWeight: 600, cursor: "pointer",
                        color: "var(--text-primary)",
                        display: "inline-flex", alignItems: "center", gap: 4,
                      }}
                    >
                      {transition.label}
                      {transition.next === "SETTLED"
                        ? <CheckCircle2 size={12} />
                        : <ArrowRight size={12} />}
                    </button>
                  ) : (
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Done</span>
                  )}
                </td>
              </tr>
            );
          })}

          {settlements.length === 0 && (
            <tr>
              <td colSpan={6} style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                No COD collections recorded. Book a shipment with COD payment to get started.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
