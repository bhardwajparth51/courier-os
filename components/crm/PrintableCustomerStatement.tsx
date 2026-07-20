"use client";

import { Printer } from "lucide-react";

interface Props {
  ledgerData: {
    customer: any;
    totalDebit: number;
    totalCredit: number;
    outstandingBalance: number;
    entries: any[];
  };
}

export function PrintableCustomerStatement({ ledgerData }: Props) {
  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      {/* Top Controls */}
      <div className="no-print" style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
        <button type="button" onClick={handlePrint} className="btn btn-primary btn-sm" style={{ gap: 6 }}>
          <Printer size={14} /> Print Customer Statement PDF
        </button>
      </div>

      {/* Printable Account Statement Document */}
      <div
        className="printable-area card"
        style={{
          padding: 36,
          background: "white",
          color: "#111827",
          fontFamily: "Inter, sans-serif",
          fontSize: 13,
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid #E31E24", paddingBottom: 16, marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: "Outfit, sans-serif", fontSize: 22, fontWeight: 800, color: "#E31E24" }}>
              DTDC COURIER FRANCHISE
            </div>
            <div style={{ fontSize: 12, color: "#4B5563", marginTop: 2 }}>
              Franchise Outlet: DTDC Pune Central Branch · GSTIN: 27AAAAA0000A1Z5
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 18, fontWeight: 800 }}>CUSTOMER STATEMENT</div>
            <div style={{ fontSize: 11, color: "#6B7280" }}>Statement Date: {currentDate}</div>
          </div>
        </div>

        {/* Customer & Summary Box */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24, padding: 16, background: "#F9FAFB", borderRadius: 8, border: "1px solid #E5E7EB" }}>
          <div>
            <span style={{ fontSize: 10, color: "#6B7280", textTransform: "uppercase" }}>STATEMENT FOR</span>
            <div style={{ fontWeight: 800, fontSize: 16 }}>{ledgerData.customer.name}</div>
            {ledgerData.customer.companyName && (
              <div style={{ fontWeight: 600, color: "#4B5563", fontSize: 12 }}>{ledgerData.customer.companyName}</div>
            )}
            <div style={{ fontSize: 11.5, color: "#6B7280", marginTop: 4 }}>
              Phone: {ledgerData.customer.phone} · GST: {ledgerData.customer.gstNumber || "N/A"}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: 10, color: "#6B7280", textTransform: "uppercase" }}>OUTSTANDING LEDGER BALANCE</span>
            <div style={{ fontWeight: 800, fontSize: 22, color: ledgerData.outstandingBalance > 0 ? "#E31E24" : "#16A34A" }}>
              ₹{ledgerData.outstandingBalance.toLocaleString("en-IN")}
            </div>
            <div style={{ fontSize: 11, color: "#6B7280", marginTop: 4 }}>
              Total Debits: ₹{ledgerData.totalDebit.toLocaleString("en-IN")} | Credits: ₹{ledgerData.totalCredit.toLocaleString("en-IN")}
            </div>
          </div>
        </div>

        {/* Itemized Ledger Table */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 30 }}>
          <thead>
            <tr style={{ background: "#F3F4F6", borderBottom: "2px solid #D1D5DB" }}>
              <th style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, fontWeight: 700 }}>Date</th>
              <th style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, fontWeight: 700 }}>Reference</th>
              <th style={{ padding: "8px 12px", textAlign: "right", fontSize: 11, fontWeight: 700 }}>Debit (₹)</th>
              <th style={{ padding: "8px 12px", textAlign: "right", fontSize: 11, fontWeight: 700 }}>Credit (₹)</th>
              <th style={{ padding: "8px 12px", textAlign: "right", fontSize: 11, fontWeight: 700 }}>Balance (₹)</th>
            </tr>
          </thead>
          <tbody>
            {ledgerData.entries.map((entry, idx) => (
              <tr key={idx} style={{ borderBottom: "1px solid #E5E7EB" }}>
                <td style={{ padding: "8px 12px", fontSize: 11.5, fontFamily: "monospace" }}>
                  {new Date(entry.date).toLocaleDateString("en-IN")}
                </td>
                <td style={{ padding: "8px 12px", fontWeight: 700, fontSize: 12 }}>{entry.reference}</td>
                <td style={{ padding: "8px 12px", textAlign: "right", fontFamily: "monospace", fontSize: 12 }}>
                  {entry.debit > 0 ? `₹${entry.debit.toLocaleString("en-IN")}` : "-"}
                </td>
                <td style={{ padding: "8px 12px", textAlign: "right", fontFamily: "monospace", fontSize: 12, color: "#16A34A" }}>
                  {entry.credit > 0 ? `₹${entry.credit.toLocaleString("en-IN")}` : "-"}
                </td>
                <td style={{ padding: "8px 12px", textAlign: "right", fontFamily: "monospace", fontWeight: 800, fontSize: 12 }}>
                  ₹{entry.balance.toLocaleString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer & Signatures */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 40, paddingTop: 20, borderTop: "1px solid #E5E7EB" }}>
          <div>
            <div style={{ fontSize: 11, color: "#6B7280" }}>Authorized Franchise Stamp:</div>
            <div style={{ fontWeight: 700, marginTop: 4 }}>DTDC Pankaj Agencies</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ borderTop: "1px dashed #9CA3AF", width: 160, paddingTop: 4, fontSize: 10, color: "#6B7280", margin: "0 0 0 auto" }}>Accounts Representative</div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * { visibility: hidden !important; }
          .no-print { display: none !important; }
          .printable-area, .printable-area * { visibility: visible !important; }
          .printable-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            border: none !important;
          }
        }
      `}</style>
    </div>
  );
}
