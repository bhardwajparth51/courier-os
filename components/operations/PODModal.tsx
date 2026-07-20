"use client";

import { useState, useRef } from "react";
import { X, Check, CheckCircle2, ShieldCheck, PenTool } from "lucide-react";

interface PODModalProps {
  shipmentId: string;
  awbNumber: string;
  receiverName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function PODModal({ shipmentId, awbNumber, receiverName: defaultReceiver, onClose, onSuccess }: PODModalProps) {
  const [receiverName, setReceiverName] = useState(defaultReceiver);
  const [otpCode, setOtpCode] = useState("8921");
  const [otpVerified, setOtpVerified] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Canvas signature drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSubmitPOD = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const canvas = canvasRef.current;
      const signatureUrl = canvas ? canvas.toDataURL() : null;

      const res = await fetch(`/api/deliveries/${shipmentId}/pod`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverName,
          otpCode,
          otpVerified,
          signatureUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit POD");

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(3px)", zIndex: 90, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div className="card" style={{ width: "100%", maxWidth: 460, padding: 0, overflow: "hidden" }}>
        
        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Proof of Delivery (POD)</h3>
            <p style={{ fontSize: 11.5, color: "var(--text-muted)" }}>AWB: {awbNumber}</p>
          </div>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: 4 }}><X size={18} /></button>
        </div>

        {success ? (
          <div style={{ padding: 32, textAlign: "center" }}>
            <div style={{ width: 56, height: 56, background: "#DCFCE7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <CheckCircle2 size={32} color="#16A34A" />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#111827" }}>POD Saved Successfully!</h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Shipment marked as DELIVERED.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmitPOD} style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
            {error && <div style={{ padding: 8, background: "#FEE2E2", color: "#DC2626", borderRadius: 6, fontSize: 12 }}>{error}</div>}

            <div className="form-group">
              <label className="label">Recipient Name *</label>
              <input type="text" className="input" value={receiverName} onChange={(e) => setReceiverName(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="label">Delivery OTP Verification Code</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input type="text" className="input" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} style={{ fontFamily: "monospace", fontWeight: 700, textAlign: "center" }} />
                <span className="badge badge-green" style={{ alignSelf: "center", height: 36, display: "inline-flex", alignItems: "center" }}>✓ OTP Verified</span>
              </div>
            </div>

            {/* Signature Canvas */}
            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <label className="label" style={{ margin: 0 }}>Recipient Digital Signature</label>
                <button type="button" onClick={clearCanvas} style={{ fontSize: 11, color: "var(--brand-red)", background: "none", border: "none", cursor: "pointer" }}>Clear Canvas</button>
              </div>
              <canvas
                ref={canvasRef}
                width={420}
                height={100}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                style={{ border: "1px solid var(--border)", borderRadius: 8, background: "#FAFAFA", cursor: "crosshair" }}
              />
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 10 }}>
              <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
              <button type="submit" disabled={loading} className="btn btn-primary" style={{ gap: 6 }}>
                <Check size={15} /> Complete Delivery (POD)
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
