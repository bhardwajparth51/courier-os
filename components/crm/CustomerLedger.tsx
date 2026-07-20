"use client";

import { useState } from "react";
import { Printer, Download, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { PrintableCustomerStatement } from "./PrintableCustomerStatement";

interface Props {
  ledgerData: {
    customer: any;
    totalDebit: number;
    totalCredit: number;
    outstandingBalance: number;
    entries: any[];
  };
}

export function CustomerLedger({ ledgerData }: Props) {
  const [showPrintable, setShowPrintable] = useState(false);

  if (showPrintable) {
    return (
      <div>
        <button type="button" onClick={() => setShowPrintable(false)} className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }}>
          ← Back to Ledger Dashboard
        </button>
        <PrintableCustomerStatement ledgerData={ledgerData} />
      </div>
    );
  }

  return (
    <div>
      {/* Top Ledger Metric Bar */}
      <div className="bento-grid" style={{ marginBottom: 20 }}>
        <div className="card" style={{ gridColumn: "span 4", padding: 18 }}>
          <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase" }}>TOTAL BOOKINGS (DEBIT)</span>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#111827", marginTop: 4 }}>
            ₹{ledgerData.totalDebit.toLocaleString("en-IN")}
          </div>
        </div>
        <div className="card" style={{ gridColumn: "span 4", padding: 18 }}>
          <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase" }}>TOTAL PAID / COLLECTED (CREDIT)</span>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#16A34A", marginTop: 4 }}>
            ₹{ledgerData.totalCredit.toLocaleString("en-IN")}
          </div>
        </div>
        <div className="card" style={{ gridColumn: "span 4", padding: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase" }}>OUTSTANDING BALANCE</span>
            <div style={{ fontSize: 24, fontWeight: 800, color: ledgerData.outstandingBalance > 0 ? "var(--brand-red)" : "#16A34A", marginTop: 4 }}>
              ₹{ledgerData.outstandingBalance.toLocaleString("en-IN")}
            </div>
          </div>
          <button type="button" onClick={() => setShowPrintable(true)} className="btn btn-primary btn-sm" style={{ gap: 6 }}>
            <Printer size={14} /> Print Statement
          </button>
        </div>
      </div>

      {/* Tally-Style Itemized Ledger Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", fontWeight: 700 }}>
          Customer Financial Ledger Transactions (Tally View)
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)", textAlign: "left", fontSize: 11.5, textTransform: "uppercase", color: "var(--text-muted)" }}>
              <th style={{ padding: "12px 16px" }}>Date</th>
              <th style={{ padding: "12px 16px" }}>Transaction Reference</th>
              <th style={{ padding: "12px 16px", textAlign: "right" }}>Debit (₹)</th>
              <th style={{ padding: "12px 16px", textAlign: "right" }}>Credit (₹)</th>
              <th style={{ padding: "12px 16px", textAlign: "right" }}>Running Balance (₹)</th>
            </tr>
          </thead>
          <tbody>
            {ledgerData.entries.map((entry, idx) => (
              <tr key={idx} style={{ borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 12 }}>
                  {new Date(entry.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </td>
                <td style={{ padding: "12px 16px", fontWeight: 700 }}>{entry.reference}</td>
                <td style={{ padding: "12px 16px", textAlign: "right", fontFamily: "monospace", fontWeight: 700 }}>
                  {entry.debit > 0 ? `₹${entry.debit.toLocaleString("en-IN")}` : "-"}
                </td>
                <td style={{ padding: "12px 16px", textAlign: "right", fontFamily: "monospace", fontWeight: 700, color: "#16A34A" }}>
                  {entry.credit > 0 ? `₹${entry.credit.toLocaleString("en-IN")}` : "-"}
                </td>
                <td style={{ padding: "12px 16px", textAlign: "right", fontFamily: "monospace", fontWeight: 800 }}>
                  ₹{entry.balance.toLocaleString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
