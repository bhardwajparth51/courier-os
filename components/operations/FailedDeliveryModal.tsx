"use client";

import { useState } from "react";
import { X, AlertTriangle, RefreshCw, Undo2 } from "lucide-react";

interface FailedDeliveryModalProps {
  shipmentId: string;
  awbNumber: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function FailedDeliveryModal({ shipmentId, awbNumber, onClose, onSuccess }: FailedDeliveryModalProps) {
  const [reason, setReason] = useState("CUSTOMER_UNAVAILABLE");
  const [action, setAction] = useState<"RETRY_TOMORROW" | "RETURN_TO_ORIGIN">("RETRY_TOMORROW");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/deliveries/${shipmentId}/failed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, action, remarks }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to record attempt");

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(3px)", zIndex: 90, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div className="card" style={{ width: "100%", maxWidth: 440, padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#D97706" }}>Record Failed Delivery Attempt</h3>
            <p style={{ fontSize: 11.5, color: "var(--text-muted)" }}>AWB: {awbNumber}</p>
          </div>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: 4 }}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          {error && <div style={{ padding: 8, background: "#FEE2E2", color: "#DC2626", borderRadius: 6, fontSize: 12 }}>{error}</div>}

          <div className="form-group">
            <label className="label">Failure Reason *</label>
            <select className="select" value={reason} onChange={(e) => setReason(e.target.value)}>
              <option value="CUSTOMER_UNAVAILABLE">Customer Unavailable at Address</option>
              <option value="WRONG_ADDRESS">Incomplete / Wrong Delivery Address</option>
              <option value="REFUSED">Customer Refused Package</option>
              <option value="PHONE_UNREACHABLE">Phone Unreachable / Switched Off</option>
            </select>
          </div>

          <div className="form-group">
            <label className="label">Resolution Action *</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div
                onClick={() => setAction("RETRY_TOMORROW")}
                style={{
                  padding: 12, borderRadius: 8, border: `2px solid ${action === "RETRY_TOMORROW" ? "var(--brand-red)" : "var(--border)"}`,
                  background: action === "RETRY_TOMORROW" ? "var(--brand-red-light)" : "white", cursor: "pointer", textAlign: "center",
                }}
              >
                <RefreshCw size={16} color="var(--brand-red)" style={{ margin: "0 auto 4px" }} />
                <div style={{ fontSize: 12, fontWeight: 700 }}>Retry Tomorrow</div>
              </div>

              <div
                onClick={() => setAction("RETURN_TO_ORIGIN")}
                style={{
                  padding: 12, borderRadius: 8, border: `2px solid ${action === "RETURN_TO_ORIGIN" ? "#DC2626" : "var(--border)"}`,
                  background: action === "RETURN_TO_ORIGIN" ? "#FEE2E2" : "white", cursor: "pointer", textAlign: "center",
                }}
              >
                <Undo2 size={16} color="#DC2626" style={{ margin: "0 auto 4px" }} />
                <div style={{ fontSize: 12, fontWeight: 700, color: "#DC2626" }}>Return to Origin (RTO)</div>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="label">Remarks / Delivery Notes</label>
            <input type="text" className="input" placeholder="e.g. Door locked, neighbor notified" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 10 }}>
            <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-primary">Save Attempt</button>
          </div>
        </form>
      </div>
    </div>
  );
}
