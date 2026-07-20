"use client";

import { useState } from "react";
import { Phone, Mail, MessageSquare, MapPin, Plus } from "lucide-react";

interface Props {
  customerId: string;
  initialComms: any[];
}

export function CommunicationTimeline({ customerId, initialComms }: Props) {
  const [comms, setComms] = useState<any[]>(initialComms);
  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState<"CALL" | "SMS" | "EMAIL" | "VISIT" | "WHATSAPP">("CALL");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/customers/${customerId}/communications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, subject, message }),
      });
      const data = await res.json();
      if (res.ok) {
        setComms([data.communication, ...comms]);
        setShowModal(false);
        setSubject("");
        setMessage("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (t: string) => {
    switch (t) {
      case "EMAIL": return <Mail size={16} color="#2563EB" />;
      case "VISIT": return <MapPin size={16} color="#7C3AED" />;
      case "WHATSAPP": return <MessageSquare size={16} color="#16A34A" />;
      default: return <Phone size={16} color="var(--brand-red)" />;
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700 }}>Communication & Interaction Timeline</h3>
        <button type="button" onClick={() => setShowModal(true)} className="btn btn-primary btn-sm" style={{ gap: 4 }}>
          <Plus size={14} /> Log Communication
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {comms.map((c) => (
          <div key={c.id} className="card" style={{ padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {getTypeIcon(c.type)}
                <span style={{ fontWeight: 800, fontSize: 14 }}>{c.subject}</span>
                <span className="badge badge-blue" style={{ fontSize: 10 }}>{c.type}</span>
              </div>
              <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace" }}>
                {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            <p style={{ fontSize: 12.5, color: "#374151", margin: 0 }}>{c.message}</p>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>Logged by: {c.loggedBy}</div>
          </div>
        ))}

        {comms.length === 0 && (
          <div className="card" style={{ textAlign: "center", padding: 24, color: "var(--text-muted)", fontSize: 13 }}>
            No communication history logged yet.
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(3px)", zIndex: 90, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div className="card" style={{ width: 440, padding: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Log Customer Communication</h3>
            <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="form-group">
                <label className="label">Interaction Channel</label>
                <select className="select" value={type} onChange={(e) => setType(e.target.value as any)}>
                  <option value="CALL">Phone Call</option>
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="SMS">SMS</option>
                  <option value="EMAIL">Email</option>
                  <option value="VISIT">Branch / Office Visit</option>
                </select>
              </div>

              <div className="form-group">
                <label className="label">Subject / Purpose *</label>
                <input type="text" className="input" placeholder="e.g. Discussed monthly bulk discount" value={subject} onChange={(e) => setSubject(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="label">Interaction Notes / Outcome *</label>
                <textarea className="textarea" rows={3} placeholder="Details of conversation..." value={message} onChange={(e) => setMessage(e.target.value)} required />
              </div>

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 10 }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost">Cancel</button>
                <button type="submit" disabled={loading} className="btn btn-primary">Log Interaction</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
