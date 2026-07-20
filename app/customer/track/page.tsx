"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { Search, MapPin, Package, CheckCircle2, Clock, Truck } from "lucide-react";

export default function CustomerTrackPage() {
  const searchParams = useSearchParams();
  const initialAwb = searchParams.get("awb") || "";

  const [awbInput, setAwbInput] = useState(initialAwb);
  const [shipment, setShipment] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = async (awbToTrack: string) => {
    if (!awbToTrack) return;
    setLoading(true);
    setError("");
    setShipment(null);

    try {
      const res = await fetch(`/api/tracking/${encodeURIComponent(awbToTrack.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Shipment not found");

      setShipment(data.shipment);
    } catch (err: any) {
      setError(err.message || "Could not fetch tracking status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialAwb) {
      handleTrack(initialAwb);
    }
  }, [initialAwb]);

  return (
    <div>
      <Header title="Track Your Parcel" subtitle="Enter your 12-character DTDC AWB consignment number" />

      <div className="page-container" style={{ maxWidth: 800 }}>

        {/* Search Card */}
        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleTrack(awbInput);
            }}
            style={{ display: "flex", gap: 12 }}
          >
            <div style={{ position: "relative", flex: 1 }}>
              <Search size={18} color="var(--text-muted)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                className="input"
                placeholder="e.g. DTDC17718277"
                value={awbInput}
                onChange={(e) => setAwbInput(e.target.value)}
                style={{ paddingLeft: 42, height: 46, fontSize: 15, fontFamily: "monospace", fontWeight: 700 }}
              />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: "0 24px", height: 46 }}>
              {loading ? "Searching..." : "Track Parcel"}
            </button>
          </form>

          {error && (
            <div style={{ padding: 12, background: "#FEE2E2", color: "#DC2626", borderRadius: 8, fontSize: 13, marginTop: 16 }}>
              {error}
            </div>
          )}
        </div>

        {/* Tracking Details Display */}
        {shipment && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* Shipment Summary Card */}
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid var(--border)", paddingBottom: 16, marginBottom: 16 }}>
                <div>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase" }}>CONSIGNMENT NUMBER</span>
                  <div style={{ fontSize: 20, fontFamily: "monospace", fontWeight: 800, color: "var(--brand-red)" }}>
                    {shipment.awbNumber}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                    From <strong>{shipment.senderCity}</strong> to <strong>{shipment.receiverCity}</strong>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span className="badge badge-green" style={{ fontSize: 12 }}>{shipment.status}</span>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
                    Expected: {shipment.expectedDelivery ? new Date(shipment.expectedDelivery).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}
                  </div>
                </div>
              </div>

              {/* Recipient & Branch Info */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, fontSize: 13 }}>
                <div>
                  <span style={{ color: "var(--text-muted)", fontSize: 11 }}>RECIPIENT NAME</span>
                  <div style={{ fontWeight: 700 }}>{shipment.receiverName}</div>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", fontSize: 11 }}>ORIGIN FRANCHISE</span>
                  <div style={{ fontWeight: 700 }}>{shipment.branch?.name ?? "DTDC Franchise"}</div>
                </div>
              </div>
            </div>

            {/* 10-Stage Vertical Timeline */}
            <div className="card" style={{ padding: 28 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Parcel Journey Timeline</h3>

              <div style={{ display: "flex", flexDirection: "column", gap: 20, position: "relative", paddingLeft: 24 }}>
                <div style={{ position: "absolute", left: 7, top: 8, bottom: 8, width: 2, background: "var(--border)" }} />

                {shipment.trackingEvents.map((ev: any) => (
                  <div key={ev.id} style={{ position: "relative" }}>
                    <div style={{
                      position: "absolute", left: -24, top: 4, width: 14, height: 14, borderRadius: "50%",
                      background: ev.status === "DELIVERED" ? "#10B981" : "var(--brand-red)", border: "3px solid white", boxShadow: "0 0 0 1px var(--border)",
                    }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
                          {ev.status.replace(/_/g, " ")} — {ev.location}
                        </div>
                        <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2 }}>{ev.description}</p>
                      </div>
                      <span style={{ fontSize: 11.5, fontFamily: "monospace", color: "var(--text-muted)" }}>
                        {new Date(ev.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
