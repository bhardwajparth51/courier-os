"use client";

import { useState } from "react";
import { Truck, CheckCircle2, AlertTriangle, Clock, Plus, Check } from "lucide-react";
import { PODModal } from "@/components/operations/PODModal";
import { FailedDeliveryModal } from "@/components/operations/FailedDeliveryModal";

interface DeliveryRunBoardProps {
  initialRuns: any[];
  pendingShipments: any[];
}

export function DeliveryRunBoard({ initialRuns, pendingShipments }: DeliveryRunBoardProps) {
  const [runs, setRuns] = useState<any[]>(initialRuns);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedShipmentIds, setSelectedShipmentIds] = useState<string[]>([]);
  const [vehicleNumber, setVehicleNumber] = useState("MH-12-EV-9821");

  // Selected shipment for POD / Failed
  const [podShipment, setPodShipment] = useState<any | null>(null);
  const [failedShipment, setFailedShipment] = useState<any | null>(null);

  const toggleShipmentSelect = (id: string) => {
    setSelectedShipmentIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleCreateRun = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedShipmentIds.length === 0) return;

    try {
      const res = await fetch("/api/deliveries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleNumber, shipmentIds: selectedShipmentIds }),
      });
      const data = await res.json();
      if (res.ok) {
        setRuns([data.run, ...runs]);
        setShowCreateModal(false);
        setSelectedShipmentIds([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      {/* Top Action Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800 }}>Delivery Runs & POD Command</h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Assign delivery runs, process proof of delivery (POD), and manage failed attempts</p>
        </div>

        <button type="button" onClick={() => setShowCreateModal(true)} className="btn btn-primary" style={{ gap: 6 }}>
          <Plus size={16} /> Create Delivery Run
        </button>
      </div>

      {/* Grid of Delivery Run Board Cards */}
      <div className="bento-grid">
        {runs.map((r) => {
          const runShipments = r.runShipments ?? [];
          const total = runShipments.length;
          const delivered = runShipments.filter((rs: any) => rs.status === "DELIVERED").length;
          const failed = runShipments.filter((rs: any) => rs.status === "FAILED").length;
          const pending = total - delivered - failed;

          return (
            <div key={r.id} className="card" style={{ gridColumn: "span 6", padding: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <span style={{ fontFamily: "monospace", fontSize: 15, fontWeight: 800, color: "var(--brand-red)" }}>
                    {r.runNumber}
                  </span>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Vehicle: {r.vehicleNumber ?? "E-Bike"}</div>
                </div>
                <span className="badge badge-blue">{r.status}</span>
              </div>

              {/* Run Metrics Tiles */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, padding: 10, background: "var(--bg-subtle)", borderRadius: 8, textAlign: "center", marginBottom: 14 }}>
                <div><span style={{ fontSize: 10, color: "var(--text-muted)" }}>TOTAL</span><div style={{ fontWeight: 800, fontSize: 14 }}>{total}</div></div>
                <div><span style={{ fontSize: 10, color: "var(--text-muted)" }}>DELIVERED</span><div style={{ fontWeight: 800, fontSize: 14, color: "#16A34A" }}>{delivered}</div></div>
                <div><span style={{ fontSize: 10, color: "var(--text-muted)" }}>PENDING</span><div style={{ fontWeight: 800, fontSize: 14, color: "#D97706" }}>{pending}</div></div>
                <div><span style={{ fontSize: 10, color: "var(--text-muted)" }}>FAILED</span><div style={{ fontWeight: 800, fontSize: 14, color: "#DC2626" }}>{failed}</div></div>
              </div>

              {/* Shipments inside Run */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {runShipments.map((rs: any) => {
                  const displayAwb = rs.shipmentId;
                  return (
                    <div key={rs.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12 }}>
                      <span style={{ fontFamily: "monospace", fontWeight: 700 }}>{displayAwb}</span>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <span className={rs.status === "DELIVERED" ? "badge badge-green" : rs.status === "FAILED" ? "badge badge-red" : "badge badge-amber"}>
                          {rs.status}
                        </span>

                        {rs.status === "PENDING" && (
                          <>
                            <button
                              type="button"
                              onClick={() => setPodShipment({ id: rs.shipmentId, awbNumber: displayAwb, receiverName: "Receiver" })}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: "2px 8px", fontSize: 11 }}
                            >
                              POD
                            </button>
                            <button
                              type="button"
                              onClick={() => setFailedShipment({ id: rs.shipmentId, awbNumber: displayAwb })}
                              className="btn btn-ghost btn-sm"
                              style={{ padding: "2px 8px", fontSize: 11, color: "#DC2626" }}
                            >
                              Failed
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {runs.length === 0 && (
          <div className="card" style={{ gridColumn: "span 12", textAlign: "center", padding: 36, color: "var(--text-muted)" }}>
            No active delivery runs created today. Click "Create Delivery Run" above.
          </div>
        )}
      </div>

      {/* Create Delivery Run Modal */}
      {showCreateModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(3px)", zIndex: 90, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div className="card" style={{ width: 480, padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Create New Delivery Run</h3>
            <form onSubmit={handleCreateRun} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="form-group">
                <label className="label">Delivery Vehicle</label>
                <input type="text" className="input" value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="label">Select Out-For-Delivery Shipments ({selectedShipmentIds.length} selected)</label>
                <div style={{ maxHeight: 180, overflowY: "auto", border: "1px solid var(--border)", borderRadius: 8, padding: 8 }}>
                  {pendingShipments.map((s) => (
                    <label key={s.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", cursor: "pointer", fontSize: 12 }}>
                      <input type="checkbox" checked={selectedShipmentIds.includes(s.id)} onChange={() => toggleShipmentSelect(s.id)} />
                      <span style={{ fontFamily: "monospace", fontWeight: 700 }}>{s.awbNumber}</span> — {s.receiverName} ({s.receiverCity})
                    </label>
                  ))}
                  {pendingShipments.length === 0 && (
                    <div style={{ fontSize: 12, color: "var(--text-muted)", padding: 8 }}>No pending shipments available for delivery.</div>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 10 }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-ghost">Cancel</button>
                <button type="submit" disabled={selectedShipmentIds.length === 0} className="btn btn-primary">Start Delivery Run</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modals */}
      {podShipment && (
        <PODModal
          shipmentId={podShipment.id}
          awbNumber={podShipment.awbNumber}
          receiverName={podShipment.receiverName}
          onClose={() => setPodShipment(null)}
          onSuccess={() => {
            // refresh
            fetch("/api/deliveries").then((r) => r.json()).then((d) => d.runs && setRuns(d.runs));
          }}
        />
      )}
      {failedShipment && (
        <FailedDeliveryModal
          shipmentId={failedShipment.id}
          awbNumber={failedShipment.awbNumber}
          onClose={() => setFailedShipment(null)}
          onSuccess={() => {
            fetch("/api/deliveries").then((r) => r.json()).then((d) => d.runs && setRuns(d.runs));
          }}
        />
      )}
    </div>
  );
}
