"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Clock, MapPin, CheckCircle, Loader2 } from "lucide-react";

export default function CustomerNewPickupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    senderName: "",
    senderPhone: "",
    address: "",
    city: "Pune",
    pincode: "411001",
    scheduledDate: new Date().toISOString().slice(0, 10),
    preferredTime: "Morning (10 AM - 1 PM)",
    remarks: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<any>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/pickups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to schedule pickup");

      setSuccess(data.pickup);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header title="Request Doorstep Pickup" subtitle="Schedule an agent to pick up your parcel from home or office" />

      <div className="page-container" style={{ maxWidth: 640 }}>
        {success ? (
          <div className="card" style={{ padding: 32, textAlign: "center" }}>
            <div style={{ width: 52, height: 52, background: "#DCFCE7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <CheckCircle size={30} color="#16A34A" />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800 }}>Pickup Scheduled!</h2>
            <div style={{ fontFamily: "monospace", fontSize: 16, fontWeight: 700, color: "var(--brand-red)", margin: "8px 0 16px" }}>
              Ref: {success.pickupNumber}
            </div>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
              A DTDC pickup executive has been notified and will contact you before arrival.
            </p>
            <button type="button" onClick={() => router.push("/customer/dashboard")} className="btn btn-primary">
              Return to Dashboard
            </button>
          </div>
        ) : (
          <div className="card" style={{ padding: 28 }}>
            {error && (
              <div style={{ padding: 10, background: "#FEE2E2", color: "#DC2626", borderRadius: 8, fontSize: 12, marginBottom: 16 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="form-group">
                <label className="label">Your Name *</label>
                <input type="text" className="input" placeholder="e.g. Poonam Reddy" value={formData.senderName} onChange={(e) => setFormData({ ...formData, senderName: e.target.value })} required />
              </div>

              <div className="form-group">
                <label className="label">Phone Number *</label>
                <input type="text" className="input" placeholder="e.g. +91 98220 12345" value={formData.senderPhone} onChange={(e) => setFormData({ ...formData, senderPhone: e.target.value })} required />
              </div>

              <div className="form-group">
                <label className="label">Pickup Address *</label>
                <input type="text" className="input" placeholder="House/Flat No, Street Name" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} required />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group">
                  <label className="label">City</label>
                  <input type="text" className="input" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="label">Pincode</label>
                  <input type="text" className="input" value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group">
                  <label className="label">Preferred Date</label>
                  <input type="date" className="input" value={formData.scheduledDate} onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="label">Preferred Time Slot</label>
                  <select className="select" value={formData.preferredTime} onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}>
                    <option value="Morning (10 AM - 1 PM)">Morning (10 AM - 1 PM)</option>
                    <option value="Afternoon (1 PM - 4 PM)">Afternoon (1 PM - 4 PM)</option>
                    <option value="Evening (4 PM - 7 PM)">Evening (4 PM - 7 PM)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="label">Additional Remarks / Landmark</label>
                <input type="text" className="input" placeholder="e.g. Near Metro Station Gate 2" value={formData.remarks} onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} />
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: 10, padding: 12 }}>
                {loading ? <Loader2 size={16} className="animate-spin" /> : "Submit Pickup Request"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
