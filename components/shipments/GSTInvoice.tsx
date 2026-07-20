"use client";

import { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Printer, X, Download } from "lucide-react";

interface GSTInvoiceProps {
  shipment: {
    awbNumber: string;
    senderName: string;
    senderPhone: string;
    senderAddress: string;
    senderCity: string;
    senderState: string;
    senderPincode: string;
    receiverName: string;
    receiverPhone: string;
    receiverCity: string;
    serviceType: string;
    weight: number;
    freightCharge: number;
    fuelSurcharge: number;
    insuranceCharge: number;
    codAmount: number;
    totalAmount: number;
    paymentMethod: string;
    createdAt: Date | string;
    branch?: {
      name: string;
      address: string;
      city: string;
      state: string;
      pincode: string;
      phone: string;
      email?: string | null;
      settings?: { gstNumber?: string; franchiseCode?: string } | null;
    } | null;
    invoice?: {
      invoiceNumber: string;
      amount: number;
      tax: number;
      total: number;
      issuedAt: Date | string;
    } | null;
  };
  onClose?: () => void;
}

export function GSTInvoice({ shipment, onClose }: GSTInvoiceProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const invoiceNum = shipment.invoice?.invoiceNumber ?? `INV-2026-${shipment.awbNumber.slice(-4)}`;
  const issueDateStr = new Date(shipment.invoice?.issuedAt ?? shipment.createdAt).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });

  const subtotal = shipment.invoice?.amount ?? Math.round(shipment.totalAmount / 1.18);
  const gstTax = shipment.invoice?.tax ?? (shipment.totalAmount - subtotal);
  const cgst = Math.round(gstTax / 2);
  const sgst = gstTax - cgst;

  const trackingUrl = typeof window !== "undefined"
    ? `${window.location.origin}/customer/track?awb=${shipment.awbNumber}`
    : `http://localhost:3001/customer/track?awb=${shipment.awbNumber}`;

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
      zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div style={{
        background: "white", borderRadius: 16, width: "100%", maxWidth: 680,
        boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column",
        maxHeight: "94vh", overflow: "hidden",
      }}>

        {/* Modal Controls */}
        <div className="no-print" style={{
          padding: "14px 22px", borderBottom: "1px solid #E5E7EB", display: "flex",
          alignItems: "center", justifyContent: "space-between", background: "#FAFAFA",
        }}>
          <div>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
              Official Tax Invoice
            </span>
            <span style={{ fontSize: 11, color: "#6B7280", display: "block" }}>
              {invoiceNum} · AWB: {shipment.awbNumber}
            </span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={handlePrint} className="btn btn-primary btn-sm" style={{ gap: 6 }}>
              <Printer size={14} />
              Print / PDF
            </button>
            {onClose && (
              <button type="button" onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: 6 }}>
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* ── PRINTABLE INVOICE BODY ── */}
        <div style={{ padding: 28, overflowY: "auto", flex: 1 }}>
          <div
            ref={printRef}
            className="printable-area"
            style={{
              background: "white",
              color: "#111827",
              fontFamily: "Inter, sans-serif",
              fontSize: 13,
            }}
          >
            {/* Header: Franchise Info & Invoice Metadata */}
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid #E31E24", paddingBottom: 16, marginBottom: 20 }}>
              <div>
                <div style={{ fontFamily: "Outfit, sans-serif", fontSize: 20, fontWeight: 800, color: "#E31E24" }}>
                  {shipment.branch?.name ?? "DTDC Pankaj Agencies"}
                </div>
                <div style={{ fontSize: 11.5, color: "#4B5563", marginTop: 4 }}>
                  {shipment.branch?.address ?? "Shop 12, Ground Floor, Station Road"}, {shipment.branch?.city ?? "Pune"}, {shipment.branch?.state ?? "Maharashtra"} – {shipment.branch?.pincode ?? "411001"}<br />
                  Ph: {shipment.branch?.phone ?? "+91 98220 12345"} · Email: {shipment.branch?.email ?? "pune.branch@dtdc.demo"}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#111827", marginTop: 6 }}>
                  GSTIN: <span style={{ fontFamily: "monospace" }}>{shipment.branch?.settings?.gstNumber ?? "27AAACD9281P1Z5"}</span>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#111827" }}>TAX INVOICE</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#E31E24", marginTop: 2 }}>{invoiceNum}</div>
                <div style={{ fontSize: 11, color: "#6B7280", marginTop: 4 }}>Date: {issueDateStr}</div>
                <div style={{ fontSize: 11, color: "#6B7280" }}>AWB: {shipment.awbNumber}</div>
              </div>
            </div>

            {/* Billed To / Shipped To Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20, padding: 12, background: "#F9FAFB", borderRadius: 8, border: "1px solid #E5E7EB" }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, color: "#6B7280", textTransform: "uppercase", marginBottom: 4 }}>BILLED TO (SENDER):</div>
                <div style={{ fontWeight: 700, fontSize: 13.5 }}>{shipment.senderName}</div>
                <div style={{ fontSize: 11.5, color: "#4B5563" }}>Ph: {shipment.senderPhone}</div>
                <div style={{ fontSize: 11.5, color: "#4B5563" }}>{shipment.senderAddress}, {shipment.senderCity}, {shipment.senderState} - {shipment.senderPincode}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, color: "#6B7280", textTransform: "uppercase", marginBottom: 4 }}>CONSIGNEE (RECEIVER):</div>
                <div style={{ fontWeight: 700, fontSize: 13.5 }}>{shipment.receiverName}</div>
                <div style={{ fontSize: 11.5, color: "#4B5563" }}>Ph: {shipment.receiverPhone}</div>
                <div style={{ fontSize: 11.5, color: "#4B5563" }}>Destination: {shipment.receiverCity}</div>
              </div>
            </div>

            {/* Itemized Table */}
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20 }}>
              <thead>
                <tr style={{ background: "#F3F4F6", borderBottom: "1px solid #D1D5DB" }}>
                  <th style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, fontWeight: 700 }}>Description</th>
                  <th style={{ padding: "8px 12px", textAlign: "center", fontSize: 11, fontWeight: 700 }}>Service</th>
                  <th style={{ padding: "8px 12px", textAlign: "center", fontSize: 11, fontWeight: 700 }}>Weight</th>
                  <th style={{ padding: "8px 12px", textAlign: "right", fontSize: 11, fontWeight: 700 }}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px solid #E5E7EB" }}>
                  <td style={{ padding: "10px 12px" }}>
                    <strong>Freight & Logistics Service</strong><br />
                    <span style={{ fontSize: 11, color: "#6B7280" }}>Courier transportation charge</span>
                  </td>
                  <td style={{ padding: "10px 12px", textAlign: "center" }}>{shipment.serviceType}</td>
                  <td style={{ padding: "10px 12px", textAlign: "center" }}>{shipment.weight} kg</td>
                  <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 600 }}>₹{shipment.freightCharge}</td>
                </tr>
                {shipment.insuranceCharge > 0 && (
                  <tr style={{ borderBottom: "1px solid #E5E7EB" }}>
                    <td style={{ padding: "10px 12px" }} colSpan={3}>Declared Value Insurance Cover</td>
                    <td style={{ padding: "10px 12px", textAlign: "right" }}>₹{shipment.insuranceCharge}</td>
                  </tr>
                )}
                {shipment.paymentMethod === "COD" && (
                  <tr style={{ borderBottom: "1px solid #E5E7EB" }}>
                    <td style={{ padding: "10px 12px" }} colSpan={3}>COD Cash Collection Handling Fee</td>
                    <td style={{ padding: "10px 12px", textAlign: "right" }}>₹30</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Calculations Breakdown Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "flex-start", marginBottom: 24 }}>
              {/* Left: QR Verification & Terms */}
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <QRCodeSVG value={trackingUrl} size={76} />
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#111827" }}>Scan to Verify & Track</div>
                  <div style={{ fontSize: 10, color: "#6B7280", marginTop: 2 }}>
                    This is a computer-generated tax invoice issued by DTDC Authorized Franchise Outlet.
                  </div>
                </div>
              </div>

              {/* Right: Tax Breakdown Totals */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: 12, background: "#F9FAFB", borderRadius: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span>Taxable Subtotal:</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "#4B5563" }}>
                  <span>CGST (9%):</span>
                  <span>₹{cgst.toLocaleString("en-IN")}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "#4B5563" }}>
                  <span>SGST (9%):</span>
                  <span>₹{sgst.toLocaleString("en-IN")}</span>
                </div>
                <div style={{ height: 1, background: "#D1D5DB", margin: "4px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 800, color: "#E31E24" }}>
                  <span>Grand Total:</span>
                  <span>₹{shipment.totalAmount.toLocaleString("en-IN")}</span>
                </div>
                <div style={{ fontSize: 11, color: "#16A34A", fontWeight: 600, textAlign: "right" }}>
                  Status: {shipment.paymentMethod === "COD" ? "COD Pending" : "Paid via " + shipment.paymentMethod}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ textAlign: "center", fontSize: 10.5, color: "#9CA3AF", borderTop: "1px solid #E5E7EB", paddingTop: 10 }}>
              Thank you for choosing DTDC Courier Services. Terms & Conditions apply.
            </div>

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
