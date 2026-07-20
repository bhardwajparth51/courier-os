"use client";

import { useState, useEffect } from "react";
import { Landmark, ArrowUpRight } from "lucide-react";

export function BankDepositTable() {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [bankName, setBankName] = useState("");
  const [amount, setAmount] = useState("");
  const [slipNumber, setSlipNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchDeposits = async () => {
    const res = await fetch("/api/finance/bank-deposits");
    const data = await res.json();
    setDeposits(data.deposits || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName || !amount || !slipNumber) return;
    setSubmitting(true);

    await fetch("/api/finance/bank-deposits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bankName, amount, slipNumber }),
    });

    setBankName("");
    setAmount("");
    setSlipNumber("");
    setSubmitting(false);
    fetchDeposits();
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Loading bank ledger...</div>;

  return (
    <div className="bento-grid">
      {/* Log deposit form */}
      <div className="card" style={{ gridColumn: "span 4", padding: 20 }}>
        <h4 style={{ fontSize: 14, fontWeight: 800, marginBottom: 16 }}>Log Physical Bank Deposit</h4>
        <form onSubmit={handleDeposit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Bank Name</label>
            <select className="form-select" value={bankName} onChange={(e) => setBankName(e.target.value)} required>
              <option value="">Select Target Bank</option>
              <option value="HDFC Bank Limited">HDFC Bank Limited</option>
              <option value="State Bank of India">State Bank of India</option>
              <option value="ICICI Bank">ICICI Bank</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Amount Deposited (₹)</label>
            <input
              type="number"
              className="form-input"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Deposit Challan / Slip Number</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. SLP-29841"
              value={slipNumber}
              onChange={(e) => setSlipNumber(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={submitting} className="btn btn-primary w-full" style={{ gap: 6 }}>
            <Landmark size={14} /> {submitting ? "Depositing..." : "Log Deposit"}
          </button>
        </form>
      </div>

      {/* Deposits table */}
      <div className="card" style={{ gridColumn: "span 8", padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", fontWeight: 700 }}>
          Physical Bank Deposits Log
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)", textAlign: "left", fontSize: 11, textTransform: "uppercase", color: "var(--text-muted)" }}>
              <th style={{ padding: "12px 16px" }}>Deposit Date</th>
              <th style={{ padding: "12px 16px" }}>Bank</th>
              <th style={{ padding: "12px 16px" }}>Slip Challan</th>
              <th style={{ padding: "12px 16px", textAlign: "right" }}>Amount</th>
              <th style={{ padding: "12px 16px", textAlign: "center" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {deposits.map((d) => (
              <tr key={d.id} style={{ borderBottom: "1px solid var(--border)", fontSize: 13.5 }}>
                <td style={{ padding: "12px 16px", color: "var(--text-muted)" }}>
                  {new Date(d.depositDate).toLocaleDateString("en-IN")}
                </td>
                <td style={{ padding: "12px 16px", fontWeight: 700 }}>{d.bankName}</td>
                <td style={{ padding: "12px 16px", fontFamily: "monospace" }}>{d.slipNumber}</td>
                <td style={{ padding: "12px 16px", textAlign: "right", fontFamily: "monospace", fontWeight: 800 }}>
                  ₹{d.amount.toLocaleString("en-IN")}
                </td>
                <td style={{ padding: "12px 16px", textAlign: "center" }}>
                  <span className="badge badge-green" style={{ gap: 4 }}>
                    <ArrowUpRight size={11} /> DEPOSITED
                  </span>
                </td>
              </tr>
            ))}

            {deposits.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: 24, textAlign: "center", color: "var(--text-muted)" }}>
                  No physical cash bank deposits logged.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
