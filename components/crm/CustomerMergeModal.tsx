"use client";

import { useState } from "react";
import { X, Merge, ArrowRight, Check } from "lucide-react";

interface CustomerMergeModalProps {
  customers: any[];
  onClose: () => void;
  onSuccess: () => void;
}

export function CustomerMergeModal({ customers, onClose, onSuccess }: CustomerMergeModalProps) {
  const [primaryId, setPrimaryId] = useState("");
  const [secondaryId, setSecondaryId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleMerge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!primaryId || !secondaryId) {
      setError("Please select both primary and duplicate customer records.");
      return;
    }
    if (primaryId === secondaryId) {
      setError("Primary and Secondary records cannot be the same.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/customers/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ primaryCustomerId: primaryId, secondaryCustomerId: secondaryId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to merge records");

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "An error occurred during merge");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(3px)", zIndex: 90, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div className="card" style={{ width: "100%", maxWidth: 500, padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Merge size={18} color="var(--brand-red)" />
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Merge Duplicate Customers</h3>
          </div>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: 4 }}><X size={18} /></button>
        </div>

        <form onSubmit={handleMerge} style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          {error && <div style={{ padding: 8, background: "#FEE2E2", color: "#DC2626", borderRadius: 6, fontSize: 12 }}>{error}</div>}

          <div className="form-group">
            <label className="label">Primary Customer Record (Keep This One) *</label>
            <select className="select" value={primaryId} onChange={(e) => setPrimaryId(e.target.value)} required>
              <option value="">Select Primary Target Account...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.phone}) - {c.companyName}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="label">Duplicate Customer Record (To Merge & Delete) *</label>
            <select className="select" value={secondaryId} onChange={(e) => setSecondaryId(e.target.value)} required>
              <option value="">Select Duplicate Account to Merge...</option>
              {customers.filter((c) => c.id !== primaryId).map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.phone}) - {c.companyName}</option>
              ))}
            </select>
          </div>

          <div style={{ padding: 12, background: "#F3F4F6", borderRadius: 8, fontSize: 11.5, color: "#4B5563" }}>
            ℹ️ All shipments, addresses, notes, and documents from the duplicate record will be permanently transferred to the primary account.
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 10 }}>
            <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-primary">Merge Accounts</button>
          </div>
        </form>
      </div>
    </div>
  );
}
