"use client";

import { useState, useEffect } from "react";
import { Download, FileText, Landmark } from "lucide-react";

export function GSTDashboard() {
  const [ledger, setLedger] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/finance/gst")
      .then((res) => res.json())
      .then((data) => {
        setLedger(data.ledger || []);
        setLoading(false);
      });
  }, []);

  const handleExportCSV = () => {
    const headers = ["Date,Reference,Party,Type,Taxable Value,CGST,SGST,Total GST\n"];
    const rows = ledger.map((row) =>
      `${new Date(row.date).toLocaleDateString()},${row.reference},${row.party},${row.type},${row.taxableValue},${row.cgst},${row.sgst},${row.totalGst}`
    );
    const blob = new Blob([headers.concat(rows.join("\n"))], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `GST_Tax_Report_${new Date().toLocaleDateString()}.csv`;
    a.click();
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Loading GST registers...</div>;

  const totalOutputGst = ledger.filter((r) => r.type === "OUTPUT_TAX").reduce((acc, r) => acc + r.totalGst, 0);
  const totalInputGst = ledger.filter((r) => r.type === "INPUT_TAX").reduce((acc, r) => acc + r.totalGst, 0);
  const netGstLiability = totalOutputGst - totalInputGst;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* GST Summary Widgets */}
      <div className="bento-grid">
        <div className="card" style={{ gridColumn: "span 4", padding: 18 }}>
          <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Total Output SGST + CGST</span>
          <h3 style={{ fontSize: 22, fontWeight: 900, marginTop: 8, color: "var(--brand-red)" }}>₹{totalOutputGst.toLocaleString("en-IN")}</h3>
        </div>
        <div className="card" style={{ gridColumn: "span 4", padding: 18 }}>
          <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Purchase Input GST Claims</span>
          <h3 style={{ fontSize: 22, fontWeight: 900, marginTop: 8, color: "#16A34A" }}>₹{totalInputGst.toLocaleString("en-IN")}</h3>
        </div>
        <div className="card" style={{ gridColumn: "span 4", padding: 18 }}>
          <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Net GST Liability / Refund due</span>
          <h3 style={{ fontSize: 22, fontWeight: 900, marginTop: 8, color: netGstLiability >= 0 ? "#D97706" : "#2563EB" }}>
            ₹{netGstLiability.toLocaleString("en-IN")}
          </h3>
        </div>
      </div>

      {/* Sales / Purchase Tax Register */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>GSTR-1 & GSTR-2 Unified Tax Register</span>
          <button type="button" onClick={handleExportCSV} className="btn btn-secondary btn-sm" style={{ gap: 4 }}>
            <Download size={13} /> Export GSTR Register
          </button>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)", textAlign: "left", fontSize: 11, textTransform: "uppercase", color: "var(--text-muted)" }}>
              <th style={{ padding: "12px 16px" }}>Transaction Date</th>
              <th style={{ padding: "12px 16px" }}>Voucher Type</th>
              <th style={{ padding: "12px 16px" }}>Party Name</th>
              <th style={{ padding: "12px 16px" }}>Tax Category</th>
              <th style={{ padding: "12px 16px", textAlign: "right" }}>Taxable Value</th>
              <th style={{ padding: "12px 16px", textAlign: "right" }}>CGST (9%)</th>
              <th style={{ padding: "12px 16px", textAlign: "right" }}>SGST (9%)</th>
              <th style={{ padding: "12px 16px", textAlign: "right" }}>Total Tax</th>
            </tr>
          </thead>
          <tbody>
            {ledger.map((row, idx) => (
              <tr key={idx} style={{ borderBottom: "1px solid var(--border)", fontSize: 13.5 }}>
                <td style={{ padding: "12px 16px", color: "var(--text-muted)" }}>
                  {new Date(row.date).toLocaleDateString("en-IN")}
                </td>
                <td style={{ padding: "12px 16px", fontWeight: 700 }}>{row.reference}</td>
                <td style={{ padding: "12px 16px" }}>{row.party}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span className={`badge ${row.type === "OUTPUT_TAX" ? "badge-red" : "badge-green"}`}>
                    {row.type}
                  </span>
                </td>
                <td style={{ padding: "12px 16px", textAlign: "right", fontFamily: "monospace" }}>₹{row.taxableValue.toLocaleString("en-IN")}</td>
                <td style={{ padding: "12px 16px", textAlign: "right", fontFamily: "monospace" }}>₹{row.cgst.toLocaleString("en-IN")}</td>
                <td style={{ padding: "12px 16px", textAlign: "right", fontFamily: "monospace" }}>₹{row.sgst.toLocaleString("en-IN")}</td>
                <td style={{ padding: "12px 16px", textAlign: "right", fontFamily: "monospace", fontWeight: 800 }}>
                  ₹{row.totalGst.toLocaleString("en-IN")}
                </td>
              </tr>
            ))}

            {ledger.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: 24, textAlign: "center", color: "var(--text-muted)" }}>
                  No taxable transactions logged.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
