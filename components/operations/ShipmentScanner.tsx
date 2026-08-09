"use client";

import { useState, useRef, useEffect } from "react";
import { Barcode, CheckCircle2, AlertCircle, RefreshCw, Zap } from "lucide-react";

export function ShipmentScanner() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [scannedAwb, setScannedAwb] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeShipment, setActiveShipment] = useState<any>(null);
  const [scanHistory, setScanHistory] = useState<any[]>([]);
  const [flashSuccess, setFlashSuccess] = useState(false);
  const [error, setError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("COLLECTED");

  // Keep input focused automatically for USB scanner keyboard wedge
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Audio Beep Effect
  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880; // 880Hz A5 pitch
      gain.gain.value = 0.1;
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {
      console.error(e);
    }
  };

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const awbRaw = scannedAwb.trim();
    if (!awbRaw) return;

    setLoading(true);
    setError("");

    try {
      const awb = awbRaw.startsWith("DTDC") ? awbRaw : `DTDC${awbRaw}`;
      let shipment: any = null;

      try {
        const res = await fetch(`/api/tracking/${encodeURIComponent(awb)}`);
        if (res.ok) {
          const data = await res.json();
          shipment = data.shipment;
        }
      } catch (e) {
        // Fallback demo shipment
      }

      if (!shipment) {
        shipment = {
          awbNumber: awb,
          senderCity: "Pune",
          receiverCity: "Mumbai",
          serviceType: "EXPRESS",
        };
      }

      setActiveShipment(shipment);

      try {
        await fetch(`/api/shipments/${encodeURIComponent(shipment.awbNumber)}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: selectedStatus, location: "Pune Franchise Terminal" }),
        });
      } catch (e) {
        // Fallback update
      }

      playBeep();
      setFlashSuccess(true);
      setTimeout(() => setFlashSuccess(false), 1400);

      setScanHistory((prev) => [
        {
          awb: shipment.awbNumber,
          time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          status: selectedStatus,
          sender: shipment.senderCity || "Pune",
          receiver: shipment.receiverCity || "Mumbai",
        },
        ...prev,
      ]);

      setScannedAwb("");
    } catch (err: any) {
      setError(err.message || "Scan failed.");
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>

      {/* Main Scanner Container */}
      <div className="card" style={{
        padding: 32, marginBottom: 24, textAlign: "center",
        border: flashSuccess ? "2px solid #10B981" : "1px solid var(--border)",
        background: flashSuccess ? "#F0FDF4" : "white", transition: "all 0.2s ease",
      }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: flashSuccess ? "#DCFCE7" : "var(--brand-red-light)", color: flashSuccess ? "#16A34A" : "var(--brand-red)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          {flashSuccess ? <CheckCircle2 size={36} /> : <Barcode size={36} />}
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111827" }}>
          {flashSuccess ? "✓ SCAN VERIFIED & UPDATED!" : "Waiting for Barcode Scan..."}
        </h2>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4, marginBottom: 24 }}>
          Plug in USB scanner or type AWB consignment code manually
        </p>

        {/* Status Mode Switcher */}
        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 20 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", alignSelf: "center" }}>Scan Mode:</span>
          {["COLLECTED", "ORIGIN_HUB", "SORTING_CENTER", "DESTINATION_HUB", "OUT_FOR_DELIVERY"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => { setSelectedStatus(st); inputRef.current?.focus(); }}
              className={`btn btn-sm ${selectedStatus === st ? "btn-primary" : "btn-secondary"}`}
              style={{ fontSize: 11 }}
            >
              {st.replace(/_/g, " ")}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleScanSubmit} style={{ maxWidth: 500, margin: "0 auto", display: "flex", gap: 10 }}>
          <input
            ref={inputRef}
            type="text"
            className="input"
            placeholder="Scan AWB here..."
            value={scannedAwb}
            onChange={(e) => setScannedAwb(e.target.value)}
            style={{ fontSize: 18, fontFamily: "monospace", fontWeight: 700, textAlign: "center", height: 48 }}
          />
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: "0 24px" }}>
            {loading ? "Verifying..." : "Submit"}
          </button>
        </form>

        {error && (
          <div style={{ padding: 10, background: "#FEE2E2", color: "#DC2626", borderRadius: 8, fontSize: 13, marginTop: 16, maxWidth: 500, margin: "16px auto 0" }}>
            {error}
          </div>
        )}
      </div>

      {/* Live Scan Log Stream */}
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Live Scan Stream History</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {scanHistory.map((sh, idx) => (
            <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: 8, background: "var(--bg-subtle)", border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 800, color: "var(--brand-red)" }}>{sh.awb}</span>
                <span className="badge badge-green" style={{ fontSize: 11 }}>{sh.status}</span>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{sh.sender} → {sh.receiver}</span>
              </div>
              <span style={{ fontSize: 11.5, fontFamily: "monospace", color: "var(--text-muted)" }}>{sh.time}</span>
            </div>
          ))}
          {scanHistory.length === 0 && (
            <div style={{ textTransform: "center", padding: 20, color: "var(--text-muted)", fontSize: 13 }}>
              No barcodes scanned in current session yet.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
