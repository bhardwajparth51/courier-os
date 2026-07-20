"use client";

import { useState } from "react";
import { ShipmentStatus } from "@prisma/client";
import { X, Check, Loader2 } from "lucide-react";

interface StatusUpdateModalProps {
  shipmentId: string;
  awbNumber: string;
  currentStatus: ShipmentStatus;
  onClose: () => void;
  onSuccess: () => void;
}

const ALL_STATUSES: { value: ShipmentStatus; label: string }[] = [
  { value: "BOOKED",           label: "Booked" },
  { value: "AWAITING_PICKUP",  label: "Awaiting Pickup" },
  { value: "COLLECTED",        label: "Collected at Branch" },
  { value: "ORIGIN_HUB",       label: "Origin Hub Arrival" },
  { value: "REGIONAL_HUB",     label: "Regional Transit Hub" },
  { value: "SORTING_CENTER",   label: "Sorting Center Dispatched" },
  { value: "DESTINATION_HUB",  label: "Destination City Hub" },
  { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { value: "DELIVERED",        label: "Delivered" },
  { value: "RTO",              label: "Return to Origin (RTO)" },
  { value: "CANCELLED",        label: "Cancelled" },
];

export function StatusUpdateModal({ shipmentId, awbNumber, currentStatus, onClose, onSuccess }: StatusUpdateModalProps) {
  const [status, setStatus] = useState<ShipmentStatus>(currentStatus);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/shipments/${shipmentId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, location, description }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(3px)",
      zIndex: 90, display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div className="card" style={{ width: "100%", maxWidth: 440, padding: 0, overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Update Tracking Status</h3>
            <p style={{ fontSize: 11.5, color: "var(--text-muted)" }}>AWB: {awbNumber}</p>
          </div>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          {error && (
            <div style={{ padding: "8px 12px", borderRadius: 6, background: "#FEE2E2", color: "#DC2626", fontSize: 12 }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="label">New Operational Status</label>
            <select
              className="select"
              value={status}
              onChange={(e) => setStatus(e.target.value as ShipmentStatus)}
              required
            >
              {ALL_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="label">Current Location / Hub</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Pune Central Sorting Hub"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="label">Remarks / Description</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Package scanned & dispatched via vehicle MH-12-AB-1234"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 10 }}>
            <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ gap: 6 }}>
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
              Save Status Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
