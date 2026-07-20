"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Package, User, MapPin, Printer, FileText, RefreshCw, Zap,
  CheckCircle2, Clock, Shield, Calendar, ArrowLeft, History, PenTool
} from "lucide-react";

import { ShippingLabel } from "@/components/shipments/ShippingLabel";
import { GSTInvoice } from "@/components/shipments/GSTInvoice";
import { StatusUpdateModal } from "@/components/shipments/StatusUpdateModal";
import { PODModal } from "@/components/operations/PODModal";

interface Props {
  shipment: any;
  activityLogs: any[];
  role?: "OWNER" | "EMPLOYEE" | "CUSTOMER";
}

const JOURNEY_STAGES = [
  { status: "BOOKED",           label: "Booked" },
  { status: "AWAITING_PICKUP",  label: "Awaiting Pickup" },
  { status: "COLLECTED",        label: "Collected" },
  { status: "ORIGIN_HUB",       label: "Origin Hub" },
  { status: "REGIONAL_HUB",     label: "Regional Hub" },
  { status: "SORTING_CENTER",   label: "Sorting Center" },
  { status: "DESTINATION_HUB",  label: "Destination Hub" },
  { status: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { status: "DELIVERED",        label: "Delivered" },
];

export function ShipmentDetailView({ shipment: initialShipment, activityLogs: initialLogs, role = "EMPLOYEE" }: Props) {
  const router = useRouter();
  const [shipment, setShipment] = useState(initialShipment);
  const [activityLogs, setActivityLogs] = useState(initialLogs);
  const [activeTab, setActiveTab] = useState<"overview" | "timeline" | "info" | "payment" | "logs">("overview");

  // Modals & Simulating
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPodModal, setShowPodModal] = useState(false);
  const [simulating, setSimulating] = useState(false);


  const reloadShipment = async () => {
    try {
      const res = await fetch(`/api/shipments/${shipment.id}`);
      const data = await res.json();
      if (data.shipment) {
        setShipment(data.shipment);
        setActivityLogs(data.activityLogs || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // ⚡ Dev Tracking Simulator (Fast-forward to next stage)
  const handleSimulateNextStage = async () => {
    setSimulating(true);
    try {
      const res = await fetch(`/api/shipments/${shipment.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ simulate: true }),
      });
      if (res.ok) {
        await reloadShipment();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
  };

  // Journey stage helper
  const currentStageIndex = JOURNEY_STAGES.findIndex((s) => s.status === shipment.status);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>

      {/* Back Button & Top Navigation */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <button type="button" onClick={() => router.back()} className="btn btn-ghost btn-sm" style={{ gap: 6 }}>
          <ArrowLeft size={15} /> Back to Shipments
        </button>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: 8 }}>
          {/* Dev Simulator Button */}
          <button
            type="button"
            onClick={handleSimulateNextStage}
            disabled={simulating || shipment.status === "DELIVERED" || shipment.status === "CANCELLED"}
            className="btn btn-secondary btn-sm"
            style={{ gap: 6, borderColor: "#8B5CF6", color: "#8B5CF6" }}
          >
            <Zap size={14} className={simulating ? "animate-spin" : ""} />
            {simulating ? "Simulating..." : "⚡ Simulate Progress"}
          </button>

          <button type="button" onClick={() => setShowStatusModal(true)} className="btn btn-secondary btn-sm" style={{ gap: 6 }}>
            <RefreshCw size={14} /> Update Status
          </button>
          <button type="button" onClick={() => setShowPodModal(true)} className="btn btn-primary btn-sm" style={{ gap: 6 }}>
            <PenTool size={14} /> POD Signature
          </button>
          <button type="button" onClick={() => setShowLabelModal(true)} className="btn btn-secondary btn-sm" style={{ gap: 6 }}>
            <Printer size={14} /> Label
          </button>

          <button type="button" onClick={() => setShowInvoiceModal(true)} className="btn btn-secondary btn-sm" style={{ gap: 6 }}>
            <FileText size={14} /> Invoice
          </button>
        </div>
      </div>

      {/* Header Banner Card */}
      <div className="card" style={{ padding: "20px 24px", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h1 style={{ fontFamily: "monospace", fontSize: 22, fontWeight: 800, color: "var(--brand-red)" }}>
                {shipment.awbNumber}
              </h1>
              <span className="badge badge-gray">{shipment.serviceType}</span>
              <span className="badge badge-green">{shipment.status}</span>
            </div>
            <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 4 }}>
              Created on {new Date(shipment.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase" }}>Expected Delivery</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--status-green)" }}>
              {shipment.expectedDelivery ? new Date(shipment.expectedDelivery).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: 24, gap: 4 }}>
        {[
          { key: "overview", label: "Overview" },
          { key: "timeline", label: "Tracking Timeline" },
          { key: "info", label: "Shipment & Parcel Info" },
          { key: "payment", label: "Payment & Tax" },
          { key: "logs", label: "Activity Log" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              padding: "10px 18px", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer",
              background: "transparent", color: activeTab === tab.key ? "var(--brand-red)" : "var(--text-muted)",
              borderBottom: activeTab === tab.key ? "2px solid var(--brand-red)" : "2px solid transparent",
              transition: "all 0.15s ease",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* KPI Tiles */}
          <div className="bento-grid">
            <div className="card" style={{ gridColumn: "span 3", padding: 18 }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase" }}>TOTAL CHARGES</span>
              <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>₹{shipment.totalAmount}</div>
            </div>
            <div className="card" style={{ gridColumn: "span 3", padding: 18 }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase" }}>PAYMENT METHOD</span>
              <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>{shipment.paymentMethod}</div>
            </div>
            <div className="card" style={{ gridColumn: "span 3", padding: 18 }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase" }}>PARCEL WEIGHT</span>
              <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>{shipment.weight} kg</div>
            </div>
            <div className="card" style={{ gridColumn: "span 3", padding: 18 }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase" }}>DESTINATION</span>
              <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>{shipment.receiverCity}</div>
            </div>
          </div>

          {/* Progress Tracker Bar */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Operational Journey Progress</h3>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              {JOURNEY_STAGES.map((st, idx) => {
                const isCompleted = currentStageIndex >= idx;
                const isCurrent = currentStageIndex === idx;
                const isDeliveredStage = st.status === "DELIVERED" && isCompleted;
                
                const bulletBg = isDeliveredStage || (isCompleted && !isCurrent) 
                  ? "#16A34A" 
                  : isCurrent 
                    ? "#2563EB" 
                    : "#E2E8F0";

                const labelColor = isDeliveredStage 
                  ? "#16A34A" 
                  : isCurrent 
                    ? "#2563EB" 
                    : isCompleted 
                      ? "#15803D" 
                      : "#64748B";

                return (
                  <div key={st.status} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, position: "relative" }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: bulletBg,
                      color: isCurrent || isCompleted ? "white" : "#64748B",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700,
                      zIndex: 2,
                      boxShadow: isCurrent ? "0 0 0 3px rgba(37, 99, 235, 0.2)" : isDeliveredStage ? "0 0 0 3px rgba(22, 163, 74, 0.2)" : "none",
                    }}>
                      {isCompleted ? "✓" : "○"}
                    </div>
                    <span style={{ fontSize: 10.5, fontWeight: isCurrent || isCompleted ? 700 : 500, color: labelColor, marginTop: 6, textAlign: "center" }}>
                      {st.label}
                    </span>
                  </div>
                );
              })}

            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VERTICAL TIMELINE */}
      {activeTab === "timeline" && (
        <div className="card" style={{ padding: 28 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Vertical Tracking History</h3>

          <div style={{ display: "flex", flexDirection: "column", gap: 20, position: "relative", paddingLeft: 24 }}>
            {/* Timeline Bar Line */}
            <div style={{ position: "absolute", left: 7, top: 8, bottom: 8, width: 2, background: "var(--border)" }} />

            {shipment.trackingEvents.map((ev: any) => (
              <div key={ev.id} style={{ position: "relative" }}>
                {/* Node Bullet */}
                <div style={{
                  position: "absolute", left: -24, top: 4, width: 14, height: 14, borderRadius: "50%",
                  background: ev.status === "DELIVERED" ? "#16A34A" : "#2563EB", border: "3px solid white", boxShadow: "0 0 0 1px var(--border)",
                }} />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
                      {ev.status.replace(/_/g, " ")} — {ev.location}
                    </div>
                    <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2 }}>{ev.description}</p>
                    <span style={{ fontSize: 11, color: "var(--text-subtle)", display: "block", marginTop: 4 }}>Updated by: {ev.updatedBy ?? "Staff"}</span>
                  </div>
                  <span style={{ fontSize: 11.5, fontFamily: "monospace", color: "var(--text-muted)" }}>
                    {new Date(ev.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SHIPMENT & PARCEL INFO */}
      {activeTab === "info" && (
        <div className="bento-grid">
          <div className="card" style={{ gridColumn: "span 6", padding: 22 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 12 }}>SENDER INFORMATION</h3>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{shipment.senderName}</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Ph: {shipment.senderPhone}</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6 }}>{shipment.senderAddress}, {shipment.senderCity}, {shipment.senderState} - {shipment.senderPincode}</div>
          </div>

          <div className="card" style={{ gridColumn: "span 6", padding: 22 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 12 }}>RECEIVER INFORMATION</h3>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{shipment.receiverName}</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Ph: {shipment.receiverPhone}</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6 }}>{shipment.receiverAddress}, {shipment.receiverCity}, {shipment.receiverState} - {shipment.receiverPincode}</div>
          </div>

          <div className="card" style={{ gridColumn: "span 12", padding: 22 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 12 }}>PARCEL SPECIFICATIONS</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
              <div><span style={{ fontSize: 11, color: "var(--text-muted)" }}>Weight</span><div style={{ fontWeight: 700 }}>{shipment.weight} kg</div></div>
              <div><span style={{ fontSize: 11, color: "var(--text-muted)" }}>Dimensions</span><div style={{ fontWeight: 700 }}>{shipment.length ?? 0} x {shipment.width ?? 0} x {shipment.height ?? 0} cm</div></div>
              <div><span style={{ fontSize: 11, color: "var(--text-muted)" }}>Declared Value</span><div style={{ fontWeight: 700 }}>₹{shipment.declaredValue}</div></div>
              <div><span style={{ fontSize: 11, color: "var(--text-muted)" }}>Insurance</span><div style={{ fontWeight: 700 }}>{shipment.hasInsurance ? "Yes (Covered)" : "No"}</div></div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PAYMENT & TAX */}
      {activeTab === "payment" && (
        <div className="card" style={{ padding: 28 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Itemized Price & Tax Summary</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 500 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>Freight & Transportation Charge:</span><strong>₹{shipment.freightCharge}</strong></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>Insurance Charge:</span><strong>₹{shipment.insuranceCharge}</strong></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>COD Charge:</span><strong>₹{shipment.codAmount > 0 ? 30 : 0}</strong></div>
            <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 800, color: "var(--brand-red)" }}><span>Total Amount:</span><span>₹{shipment.totalAmount}</span></div>
          </div>
        </div>
      )}

      {/* TAB 5: SYSTEM ACTIVITY LOG */}
      {activeTab === "logs" && (
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>System Audit Trail</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {activityLogs.map((log: any) => (
              <div key={log.id} style={{ padding: 12, borderRadius: 8, background: "var(--bg-subtle)", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong style={{ fontSize: 13 }}>{log.action}</strong>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{new Date(log.performedAt).toLocaleString("en-IN")}</span>
                </div>
                <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>By: {log.performedBy}</div>
                {log.metadata && <pre style={{ fontSize: 11, background: "white", padding: 6, borderRadius: 4, marginTop: 6, overflowX: "auto" }}>{log.metadata}</pre>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {showLabelModal && <ShippingLabel shipment={shipment} onClose={() => setShowLabelModal(false)} />}
      {showInvoiceModal && <GSTInvoice shipment={shipment} onClose={() => setShowInvoiceModal(false)} />}
      {showStatusModal && (
        <StatusUpdateModal
          shipmentId={shipment.id}
          awbNumber={shipment.awbNumber}
          currentStatus={shipment.status}
          onClose={() => setShowStatusModal(false)}
          onSuccess={reloadShipment}
        />
      )}
      {showPodModal && (
        <PODModal
          shipmentId={shipment.id}
          awbNumber={shipment.awbNumber}
          receiverName={shipment.receiverName}
          onClose={() => setShowPodModal(false)}
          onSuccess={reloadShipment}
        />
      )}
    </div>
  );
}
