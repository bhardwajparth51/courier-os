"use client";

import { useRef } from "react";
import Barcode from "react-barcode";
import { QRCodeSVG } from "qrcode.react";
import { Printer, X, ShieldAlert, Package, Truck, Calendar } from "lucide-react";

interface ShippingLabelProps {
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
    receiverAddress: string;
    receiverCity: string;
    receiverState: string;
    receiverPincode: string;
    serviceType: string;
    parcelType: string;
    weight: number;
    paymentMethod: string;
    codAmount: number;
    createdAt: Date | string;
    branch?: {
      name: string;
      city: string;
      phone: string;
      settings?: { gstin?: string; franchiseCode?: string } | null;
    } | null;
  };
  onClose?: () => void;
}

export function ShippingLabel({ shipment, onClose }: ShippingLabelProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const bookingDateStr = new Date(shipment.createdAt).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });

  const trackingUrl = typeof window !== "undefined"
    ? `${window.location.origin}/customer/track?awb=${shipment.awbNumber}`
    : `http://localhost:3001/customer/track?awb=${shipment.awbNumber}`;

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
      zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      {/* Modal Card Container */}
      <div style={{
        background: "white", borderRadius: 16, width: "100%", maxWidth: 520,
        boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column",
        maxHeight: "92vh", overflow: "hidden",
      }}>

        {/* Modal Header Controls (Hidden during print) */}
        <div className="no-print" style={{
          padding: "14px 20px", borderBottom: "1px solid #E5E7EB", display: "flex",
          alignItems: "center", justifyContent: "space-between", background: "#FAFAFA",
        }}>
          <div>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
              4x6 Thermal Shipping Label
            </span>
            <span style={{ fontSize: 11, color: "#6B7280", display: "block" }}>
              AWB: {shipment.awbNumber}
            </span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={handlePrint} className="btn btn-primary btn-sm" style={{ gap: 6 }}>
              <Printer size={14} />
              Print Label
            </button>
            {onClose && (
              <button type="button" onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: 6 }}>
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* ── PRINTABLE THERMAL LABEL BODY ── */}
        <div style={{ padding: 24, overflowY: "auto", flex: 1 }}>
          <div
            ref={printRef}
            className="printable-area"
            style={{
              width: "100%",
              background: "white",
              border: "2px solid #111827",
              borderRadius: 8,
              padding: 16,
              color: "#111827",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {/* Header: Franchise Branding */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "2px solid #111827", paddingBottom: 10, marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  {shipment.branch?.name ?? "DTDC Courier Franchise"}
                </div>
                <div style={{ fontSize: 10.5, color: "#4B5563" }}>
                  {shipment.branch?.city ?? "Pune Branch"} · Ph: {shipment.branch?.phone ?? "+91 98220 12345"}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: 12, fontWeight: 800, background: "#111827", color: "white", padding: "3px 8px", borderRadius: 4 }}>
                  {shipment.serviceType}
                </span>
                <div style={{ fontSize: 10, color: "#6B7280", marginTop: 4 }}>
                  Date: {bookingDateStr}
                </div>
              </div>
            </div>

            {/* Barcode Section */}
            <div style={{ textAlign: "center", borderBottom: "2px solid #111827", paddingBottom: 10, marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Barcode
                  value={shipment.awbNumber}
                  width={1.6}
                  height={50}
                  fontSize={14}
                  margin={0}
                />
              </div>
            </div>

            {/* Recipient & Sender Address Section */}
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 12, borderBottom: "2px solid #111827", paddingBottom: 12, marginBottom: 10 }}>
              {/* Deliver To */}
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", color: "#6B7280", marginBottom: 2 }}>
                  DELIVER TO (RECIPIENT):
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#111827" }}>
                  {shipment.receiverName}
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginTop: 2 }}>
                  Ph: {shipment.receiverPhone}
                </div>
                <div style={{ fontSize: 11.5, color: "#4B5563", marginTop: 4, lineHeight: 1.3 }}>
                  {shipment.receiverAddress}<br />
                  <strong>{shipment.receiverCity}, {shipment.receiverState} – {shipment.receiverPincode}</strong>
                </div>
              </div>

              {/* QR Code & Return To */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "space-between" }}>
                <QRCodeSVG value={trackingUrl} size={68} level="M" />
                <div style={{ textAlign: "right", marginTop: 8 }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: "#6B7280" }}>RETURN TO (SENDER):</div>
                  <div style={{ fontSize: 11, fontWeight: 700 }}>{shipment.senderName}</div>
                  <div style={{ fontSize: 10, color: "#4B5563" }}>{shipment.senderCity} ({shipment.senderPincode})</div>
                </div>
              </div>
            </div>

            {/* Parcel Specs & Badges Bar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11, fontWeight: 700 }}>
              <div style={{ display: "flex", gap: 12 }}>
                <span>Weight: <strong>{shipment.weight} kg</strong></span>
                <span>Type: <strong>{shipment.parcelType}</strong></span>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {shipment.parcelType === "FRAGILE" && (
                  <span style={{ background: "#FEE2E2", color: "#DC2626", border: "1px solid #FECACA", padding: "2px 6px", borderRadius: 4, fontSize: 10, display: "inline-flex", alignItems: "center", gap: 3 }}>
                    <ShieldAlert size={11} /> FRAGILE
                  </span>
                )}
                {shipment.paymentMethod === "COD" ? (
                  <span style={{ background: "#FEF3C7", color: "#D97706", border: "1px solid #FDE68A", padding: "2px 6px", borderRadius: 4, fontSize: 10 }}>
                    COD: ₹{shipment.codAmount}
                  </span>
                ) : (
                  <span style={{ background: "#DCFCE7", color: "#16A34A", border: "1px solid #BBF7D0", padding: "2px 6px", borderRadius: 4, fontSize: 10 }}>
                    PAID ({shipment.paymentMethod})
                  </span>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Embedded Print CSS */}
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
