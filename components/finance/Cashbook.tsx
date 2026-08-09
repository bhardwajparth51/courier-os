"use client";

import { useState, useEffect } from "react";
import { CashDrawer } from "./CashDrawer";

export function Cashbook() {
  const [activeSession, setActiveSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("MISC");
  const [type, setType] = useState("INCOME");
  const [mode, setMode] = useState("CASH");
  const [desc, setDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchSession = async () => {
    const res = await fetch("/api/finance/cashbook");
    const data = await res.json();
    setActiveSession(data.activeSession);
    setLoading(false);
  };

  useEffect(() => { fetchSession(); }, []);

  const handleAddTx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !activeSession) return;
    setSubmitting(true);
    try {
      await fetch("/api/finance/cash-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: activeSession.id,
          type,
          category,
          amount: Number(amount),
          paymentMode: mode,
          description: desc || `${type === "INCOME" ? "Income" : "Expense"} - ${category}`,
        }),
      });
      setAmount(""); setDesc("");
    } catch (err) {
      console.error("Failed to add transaction:", err);
    } finally {
      setSubmitting(false);
      fetchSession();
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Loading…</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <CashDrawer activeSession={activeSession} onRefresh={fetchSession} />

      {activeSession && (
        <div style={{ display: "grid", gridTemplateColumns: "290px 1fr", gap: 14 }}>
          {/* Log form */}
          <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 10, padding: "18px 20px" }}>
            <h4 style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid var(--border-subtle)" }}>
              Log Transaction
            </h4>
            <form onSubmit={handleAddTx} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={labelStyle}>Type</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  {[
                    { val: "INCOME",  label: "Income" },
                    { val: "EXPENSE", label: "Expense" },
                  ].map((opt) => {
                    const sel = type === opt.val;
                    return (
                      <button key={opt.val} type="button" onClick={() => setType(opt.val)} style={{
                        padding: "8px", borderRadius: 6,
                        border: sel ? "1.5px solid #374151" : "1px solid var(--border)",
                        background: sel ? "#F9FAFB" : "white",
                        fontWeight: sel ? 700 : 500,
                        fontSize: 13, cursor: "pointer",
                        color: "var(--text-primary)",
                      }}>
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Category</label>
                <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="BOOKING">Booking Collection</option>
                  <option value="COD">COD Cash Delivery</option>
                  <option value="EXPENSE">Overhead Petty Cash</option>
                  <option value="BANK_DEPOSIT">Bank Cash Deposit</option>
                  <option value="MISC">Miscellaneous</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Amount (₹)</label>
                <input type="number" className="form-input" placeholder="0.00"
                  value={amount} onChange={(e) => setAmount(e.target.value)} required style={{ fontSize: 15, fontWeight: 700 }} />
              </div>

              <div>
                <label style={labelStyle}>Payment Mode</label>
                <select className="form-select" value={mode} onChange={(e) => setMode(e.target.value)}>
                  <option value="CASH">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="CARD">Card</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Description</label>
                <input type="text" className="form-input" placeholder="e.g. Courier sale, Tea expense"
                  value={desc} onChange={(e) => setDesc(e.target.value)} />
              </div>

              <button type="submit" disabled={submitting} className="btn btn-primary w-full" style={{ marginTop: 4 }}>
                {submitting ? "Submitting…" : "Log Transaction"}
              </button>
            </form>
          </div>

          {/* Ledger table */}
          <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
            <div style={{
              padding: "14px 20px", borderBottom: "1px solid var(--border)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13.5, fontWeight: 700 }}>Counter Ledger</span>
                <span style={{
                  background: "var(--bg-muted)", color: "var(--text-muted)",
                  fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
                }}>
                  {activeSession.transactions?.length ?? 0}
                </span>
              </div>
              <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
                Expected closing: <strong style={{ color: "var(--text-primary)", fontFamily: "'JetBrains Mono', monospace" }}>
                  ₹{activeSession.expectedClosing.toLocaleString("en-IN")}
                </strong>
              </span>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.06em", borderBottom: "1px solid var(--border-subtle)" }}>
                  {["Time", "Category", "Mode", "Description", "Amount"].map((h, i) => (
                    <th key={h} style={{ padding: "9px 16px", textAlign: i === 4 ? "right" : "left", fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeSession.transactions?.map((t: any) => (
                  <tr key={t.id} style={{ borderBottom: "1px solid var(--border-subtle)", fontSize: 13 }}>
                    <td style={{ padding: "11px 16px", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
                      {new Date(t.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td style={{ padding: "11px 16px" }}>
                      <span className={`badge ${t.type === "INCOME" ? "badge-green" : "badge-red"}`}>{t.category}</span>
                    </td>
                    <td style={{ padding: "11px 16px" }}>
                      <span className="badge badge-blue">{t.paymentMode}</span>
                    </td>
                    <td style={{ padding: "11px 16px", color: "var(--text-secondary)" }}>{t.description || "—"}</td>
                    <td style={{ padding: "11px 16px", textAlign: "right", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: t.type === "INCOME" ? "#15803D" : "#DC2626" }}>
                      {t.type === "INCOME" ? "+" : "-"}₹{t.amount.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
                {(!activeSession.transactions || activeSession.transactions.length === 0) && (
                  <tr>
                    <td colSpan={5} style={{ padding: 32, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                      No transactions recorded yet. Use the form to log cash movements.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 12, fontWeight: 600,
  color: "var(--text-muted)", marginBottom: 5,
};
