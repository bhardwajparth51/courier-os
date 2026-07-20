"use client";

import { Printer, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface ManifestProps {
  manifest: {
    manifestNumber: string;
    destinationHub: string;
    totalShipments: number;
    totalWeight: number;
    handledBy?: string | null;
    createdAt: Date | string;
    bag: {
      bagNumber: string;
      sealNumber?: string | null;
      originHub: string;
      vehicleNumber?: string | null;
      bagShipments: {
        shipmentId: string;
      }[];
    };
  };
}

export function DispatchManifest({ manifest }: ManifestProps) {
  const router = useRouter();

  const handlePrint = () => {
    window.print();
  };

  const dispatchDate = new Date(manifest.createdAt).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      {/* Top Controls */}
      <div className="no-print" style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <button type="button" onClick={() => router.back()} className="btn btn-ghost btn-sm" style={{ gap: 6 }}>
          <ArrowLeft size={15} /> Back to Dispatch
        </button>
        <button type="button" onClick={handlePrint} className="btn btn-primary btn-sm" style={{ gap: 6 }}>
          <Printer size={14} /> Print Manifest
        </button>
      </div>

      {/* Printable Area */}
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
              Origin: {manifest.bag.originHub} · Destination: {manifest.destinationHub}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 18, fontWeight: 800 }}>DISPATCH MANIFEST</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#E31E24", fontFamily: "monospace" }}>{manifest.manifestNumber}</div>
            <div style={{ fontSize: 11, color: "#6B7280" }}>Date: {dispatchDate}</div>
          </div>
        </div>

        {/* Summary Grid Tiles */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24, padding: 14, background: "#F9FAFB", borderRadius: 8, border: "1px solid #E5E7EB" }}>
          <div>
            <span style={{ fontSize: 10, color: "#6B7280", textTransform: "uppercase" }}>BAG NUMBER</span>
            <div style={{ fontWeight: 800, fontSize: 14, fontFamily: "monospace" }}>{manifest.bag.bagNumber}</div>
          </div>
          <div>
            <span style={{ fontSize: 10, color: "#6B7280", textTransform: "uppercase" }}>SEAL NUMBER</span>
            <div style={{ fontWeight: 800, fontSize: 14, color: "#16A34A" }}>{manifest.bag.sealNumber ?? "SEALED"}</div>
          </div>
          <div>
            <span style={{ fontSize: 10, color: "#6B7280", textTransform: "uppercase" }}>TOTAL SHIPMENTS</span>
            <div style={{ fontWeight: 800, fontSize: 14 }}>{manifest.totalShipments} AWBs</div>
          </div>
          <div>
            <span style={{ fontSize: 10, color: "#6B7280", textTransform: "uppercase" }}>TOTAL WEIGHT</span>
            <div style={{ fontWeight: 800, fontSize: 14 }}>{manifest.totalWeight} kg</div>
          </div>
        </div>

        {/* Itemized Table */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 30 }}>
          <thead>
            <tr style={{ background: "#F3F4F6", borderBottom: "2px solid #D1D5DB" }}>
              <th style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, fontWeight: 700 }}>#</th>
              <th style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, fontWeight: 700 }}>Shipment ID / AWB</th>
              <th style={{ padding: "8px 12px", textAlign: "center", fontSize: 11, fontWeight: 700 }}>Scan Status</th>
            </tr>
          </thead>
          <tbody>
            {manifest.bag.bagShipments.map((bs, idx) => (
              <tr key={bs.shipmentId || idx} style={{ borderBottom: "1px solid #E5E7EB" }}>
                <td style={{ padding: "8px 12px", fontSize: 12 }}>{idx + 1}</td>
                <td style={{ padding: "8px 12px", fontFamily: "monospace", fontWeight: 700, fontSize: 12.5 }}>
                  {bs.shipmentId}
                </td>
                <td style={{ padding: "8px 12px", textAlign: "center", fontSize: 11, color: "#16A34A", fontWeight: 600 }}>
                  VERIFIED IN BAG
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Signatures Bar */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, marginTop: 40, paddingTop: 20, borderTop: "1px solid #E5E7EB" }}>
          <div>
            <div style={{ fontSize: 11, color: "#6B7280" }}>Dispatched By (Franchise Operator):</div>
            <div style={{ fontWeight: 700, marginTop: 4 }}>{manifest.handledBy ?? "Staff Operator"}</div>
            <div style={{ marginTop: 20, borderTop: "1px dashed #9CA3AF", width: 160, paddingTop: 4, fontSize: 10, color: "#6B7280" }}>Operator Signature</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#6B7280" }}>Driver / Line-haul Receiver:</div>
            <div style={{ fontWeight: 700, marginTop: 4 }}>Vehicle: {manifest.bag.vehicleNumber ?? "DTDC Transport"}</div>
            <div style={{ marginTop: 20, borderTop: "1px dashed #9CA3AF", width: 160, paddingTop: 4, fontSize: 10, color: "#6B7280" }}>Receiver Signature</div>
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
