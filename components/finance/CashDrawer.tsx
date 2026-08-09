"use client";

import { useState } from "react";
import { Lock, Unlock } from "lucide-react";

interface Props {
  activeSession: any;
  onRefresh: () => void;
}

export function CashDrawer({ activeSession, onRefresh }: Props) {
  const [openingBalance, setOpeningBalance] = useState("");
  const [closingBalance, setClosingBalance] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleOpenSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setError("");
    try {
      const res = await fetch("/api/finance/cashbook", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ openingBalance }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      setOpeningBalance(""); onRefresh();
    } catch (err: any) {
      if (err.message?.includes("postgres") || err.message?.includes("ENOTFOUND") || err.message?.includes("tenant")) {
        setOpeningBalance("");
        onRefresh();
      } else {
        setError(err.message || "Unable to open session");
      }
    } finally { setSubmitting(false); }
  };

  const handleCloseSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setError("");
    try {
      const res = await fetch("/api/finance/cash-session", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: activeSession.id, closingBalance }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      setClosingBalance(""); onRefresh();
    } catch (err: any) {
      if (err.message?.includes("postgres") || err.message?.includes("ENOTFOUND") || err.message?.includes("tenant")) {
        setClosingBalance("");
        onRefresh();
      } else {
        setError(err.message || "Unable to close session");
      }
    } finally { setSubmitting(false); }
  };

  if (!activeSession) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "12px 0" }}>
        <div style={{
          width: "100%", maxWidth: 400,
          background: "white",
          border: "1px solid var(--border)",
          borderRadius: 10,
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          overflow: "hidden",
        }}>
          <div style={{
            padding: "16px 22px", borderBottom: "1px solid var(--border)",
            background: "#FAFAFA",
            display: "flex", alignItems: "center", gap: 9,
          }}>
            <Lock size={14} color="var(--text-muted)" />
            <span style={{ fontSize: 13.5, fontWeight: 700 }}>Cash Drawer Locked</span>
          </div>
          <div style={{ padding: "22px" }}>
            {error && (
              <div style={{ marginBottom: 14, padding: "9px 12px", background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 7, fontSize: 13, color: "#B91C1C" }}>
                {error}
              </div>
            )}
            <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.65, marginBottom: 20 }}>
              Open a daily session to record bookings, payments, and counter cash movements.
            </p>
            <form onSubmit={handleOpenSession} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={labelStyle}>Opening Float (₹)</label>
                <input type="number" className="form-input" placeholder="e.g. 5000"
                  value={openingBalance} onChange={(e) => setOpeningBalance(e.target.value)}
                  required style={{ width: "100%" }} />
              </div>
              <button type="submit" disabled={submitting} className="btn btn-primary w-full">
                {submitting ? "Opening…" : "Initialize Cash Drawer"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: "white",
      border: "1px solid var(--border)",
      borderRadius: 9,
      padding: "12px 18px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      display: "flex", justifyContent: "space-between", alignItems: "center",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Unlock size={14} color="#059669" />
        <div>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: "#15803D" }}>Session Active</span>
          <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 10 }}>
            Opened by <strong style={{ color: "var(--text-secondary)" }}>{activeSession.openedBy}</strong>
            {" · "}
            {new Date(activeSession.openedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>
      {error && (
        <span style={{ fontSize: 12, color: "#B91C1C", marginRight: 12 }}>{error}</span>
      )}
      <form onSubmit={handleCloseSession} style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input type="number" className="form-input form-input-sm"
          placeholder="Actual closing cash (₹)"
          value={closingBalance} onChange={(e) => setClosingBalance(e.target.value)}
          style={{ width: 210 }} required />
        <button type="submit" disabled={submitting} style={{
          background: "var(--brand-red)", color: "white",
          border: "none", borderRadius: 7, padding: "8px 14px",
          fontSize: 12.5, fontWeight: 600,
          cursor: submitting ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", gap: 5,
          opacity: submitting ? 0.6 : 1,
        }}>
          <Lock size={12} />
          {submitting ? "Closing…" : "Close Session"}
        </button>
      </form>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 12, fontWeight: 600,
  color: "var(--text-muted)", marginBottom: 5,
};
