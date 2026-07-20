"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, CheckCircle2, RefreshCw, Send, Bell, Mail, MessageSquare } from "lucide-react";

const CHANNELS = ["SMS", "WHATSAPP", "EMAIL"] as const;
type Channel = typeof CHANNELS[number];

const CHANNEL_COLOR: Record<Channel, string> = {
  SMS:       "#3B82F6",
  WHATSAPP:  "#16A34A",
  EMAIL:     "#7C3AED",
};

export default function NotificationsPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  // Test dispatch state
  const [testTarget, setTestTarget] = useState<"IN_APP" | "SMS" | "WHATSAPP" | "EMAIL">("IN_APP");
  const [testTitle, setTestTitle] = useState("Shipment Alert");
  const [testMessage, setTestMessage] = useState("Your DTDC shipment DTDC98410291 is out for delivery today.");
  const [testRecipient, setTestRecipient] = useState("9876543210");
  const [sendingTest, setSendingTest] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

  const seedDefaults = async () => {
    setSeeding(true);
    try {
      await fetch("/api/settings/system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "seed" }),
      });
      const res = await fetch("/api/settings/notifications");
      const d = await res.json();
      setTemplates(d.templates || []);
    } catch (e) {
      console.error("Failed to seed templates:", e);
    }
    setSeeding(false);
  };

  const load = async () => {
    try {
      const res = await fetch("/api/settings/notifications");
      const d = await res.json();
      if (!d.templates || d.templates.length === 0) {
        await seedDefaults();
      } else {
        setTemplates(d.templates);
      }
    } catch (e) {
      console.error("Failed to load templates:", e);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const sendTestNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingTest(true);
    setTestSuccess(false);

    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: testTitle,
          message: testMessage,
          category: "OPERATIONS",
          priority: "HIGH",
          recipient: testRecipient,
          channel: testTarget,
        }),
      });

      setSendingTest(false);
      setTestSuccess(true);
      setTimeout(() => setTestSuccess(false), 4000);
    } catch (err) {
      console.error("Test send failed:", err);
      setSendingTest(false);
    }
  };

  const saveTemplate = async () => {
    setSaving(true);
    if (editing.id) {
      await fetch("/api/settings/notifications", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
    } else {
      await fetch("/api/settings/notifications", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
    }
    setSaving(false);
    setEditing(null);
    load();
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm("Delete this template?")) return;
    await fetch(`/api/settings/notifications?id=${id}`, { method: "DELETE" });
    load();
  };

  const toggleEnabled = async (t: any) => {
    await fetch("/api/settings/notifications", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: t.id, enabled: !t.enabled }),
    });
    load();
  };

  const grouped = CHANNELS.reduce((acc, ch) => {
    acc[ch] = templates.filter(t => t.channel === ch);
    return acc;
  }, {} as Record<Channel, any[]>);

  return (
    <div className="page-container" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4 }}>Notification Templates & Dispatcher</h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
            Send test messages or manage templates for SMS, WhatsApp, and Email.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button onClick={seedDefaults} disabled={seeding} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 14px", borderRadius: 7, border: "1px solid var(--border)",
            background: "white", fontSize: 12.5, fontWeight: 600, cursor: "pointer",
            boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
          }}>
            <RefreshCw size={13} style={{ animation: seeding ? "spin 1s linear infinite" : "none" }} />
            {seeding ? "Seeding…" : "Load Default Templates"}
          </button>
          <button onClick={() => setEditing({ name: "", channel: "SMS", body: "", subject: "" })} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 14px", borderRadius: 7, border: "none",
            background: "var(--brand-red)", color: "white",
            fontSize: 12.5, fontWeight: 600, cursor: "pointer",
          }}>
            <Plus size={13} /> Add Template
          </button>
        </div>
      </div>

      {/* QUICK SEND TEST MESSAGE CARD */}
      <div style={{
        background: "white",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "18px 22px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <Send size={16} color="var(--brand-red)" />
          <h3 style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em" }}>Send Test Message Now</h3>
        </div>

        <form onSubmit={sendTestNotification} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "180px 1fr 200px", gap: 12 }}>
            <div>
              <label style={lbl}>Target Channel</label>
              <select className="form-input" value={testTarget} onChange={e => setTestTarget(e.target.value as any)}>
                <option value="IN_APP">🔔 In-App Bell Alert</option>
                <option value="SMS">💬 SMS Message</option>
                <option value="WHATSAPP">📱 WhatsApp Message</option>
                <option value="EMAIL">✉️ Email Notification</option>
              </select>
            </div>

            <div>
              <label style={lbl}>Title / Subject</label>
              <input className="form-input" value={testTitle} onChange={e => setTestTitle(e.target.value)} required />
            </div>

            <div>
              <label style={lbl}>{testTarget === "EMAIL" ? "Recipient Email" : "Recipient Phone"}</label>
              <input
                className="form-input"
                placeholder={testTarget === "EMAIL" ? "customer@gmail.com" : "9876543210"}
                value={testRecipient}
                onChange={e => setTestRecipient(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label style={lbl}>Message Body</label>
            <input className="form-input" value={testMessage} onChange={e => setTestMessage(e.target.value)} required />
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
            {testSuccess ? (
              <span style={{ fontSize: 12.5, fontWeight: 600, color: "#15803D", display: "flex", alignItems: "center", gap: 5 }}>
                <CheckCircle2 size={15} /> Message Sent Successfully! (Check your Bell Icon 🔔 or Terminal log)
              </span>
            ) : (
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                Clicking send will immediately dispatch the message and log it in system audit records.
              </span>
            )}

            <button type="submit" disabled={sendingTest} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 20px", borderRadius: 7, border: "none",
              background: "#111827", color: "white",
              fontSize: 12.5, fontWeight: 600, cursor: "pointer",
            }}>
              <Send size={13} /> {sendingTest ? "Sending…" : "Send Message"}
            </button>
          </div>
        </form>
      </div>

      {loading
        ? <p style={{ fontSize: 13, color: "var(--text-muted)", padding: "20px 0" }}>Loading templates…</p>
        : CHANNELS.map(ch => (
          <div key={ch} style={{ background: "white", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em",
                padding: "2px 8px", borderRadius: 5,
                background: `${CHANNEL_COLOR[ch]}18`,
                color: CHANNEL_COLOR[ch],
              }}>
                {ch}
              </span>
              <span style={{ fontSize: 13.5, fontWeight: 700 }}>
                {ch === "SMS" ? "SMS Templates" : ch === "WHATSAPP" ? "WhatsApp Templates" : "Email Templates"}
              </span>
              <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 4 }}>({grouped[ch]?.length || 0})</span>
            </div>

            {!grouped[ch] || grouped[ch].length === 0
              ? <p style={{ padding: "20px 18px", fontSize: 13, color: "var(--text-muted)" }}>No {ch} templates. Click Load Default Templates or Add Template.</p>
              : grouped[ch].map(t => (
                <div key={t.id} style={{ padding: "14px 18px", borderBottom: "1px solid var(--border-subtle)", display: "flex", gap: 14 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontFamily: "monospace", fontWeight: 700, background: "#F3F4F6", padding: "2px 6px", borderRadius: 4 }}>{t.name}</span>
                      {t.subject && <span style={{ fontSize: 12, color: "var(--text-muted)" }}>"{t.subject}"</span>}
                      <span style={{
                        fontSize: 10.5, fontWeight: 600, padding: "2px 7px", borderRadius: 5,
                        background: t.enabled ? "#ECFDF5" : "#F3F4F6",
                        color: t.enabled ? "#15803D" : "#6B7280",
                      }}>
                        {t.enabled ? "Active" : "Disabled"}
                      </span>
                    </div>
                    <p style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.6, whiteSpace: "pre-wrap", maxWidth: 600 }}>
                      {t.body}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button onClick={() => toggleEnabled(t)} style={iconBtn}
                      title={t.enabled ? "Disable" : "Enable"}>
                      <CheckCircle2 size={14} color={t.enabled ? "#15803D" : "#9CA3AF"} />
                    </button>
                    <button onClick={() => setEditing(t)} style={iconBtn} title="Edit"><Pencil size={14} color="var(--text-muted)" /></button>
                    <button onClick={() => deleteTemplate(t.id)} style={iconBtn} title="Delete"><Trash2 size={14} color="#DC2626" /></button>
                  </div>
                </div>
              ))
            }
          </div>
        ))
      }

      {/* Edit modal */}
      {editing && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
        }}>
          <div style={{
            background: "white", borderRadius: 12, padding: "24px 28px",
            width: 560, maxHeight: "85vh", overflowY: "auto",
            boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em" }}>
                {editing.id ? "Edit Template" : "New Template"}
              </h3>
              <button onClick={() => setEditing(null)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={18} color="var(--text-muted)" />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={lbl}>Template Name</label>
                  <input className="form-input" placeholder="shipment_booked" value={editing.name}
                    onChange={e => setEditing((t: any) => ({ ...t, name: e.target.value }))} />
                </div>
                <div>
                  <label style={lbl}>Channel</label>
                  <select className="form-input" value={editing.channel}
                    onChange={e => setEditing((t: any) => ({ ...t, channel: e.target.value }))}>
                    {CHANNELS.map(ch => <option key={ch} value={ch}>{ch}</option>)}
                  </select>
                </div>
              </div>

              {editing.channel === "EMAIL" && (
                <div>
                  <label style={lbl}>Subject Line</label>
                  <input className="form-input" placeholder="Invoice {{invoiceNumber}}" value={editing.subject ?? ""}
                    onChange={e => setEditing((t: any) => ({ ...t, subject: e.target.value }))} />
                </div>
              )}

              <div>
                <label style={lbl}>Message Body</label>
                <textarea
                  className="form-input"
                  placeholder={"Use {{variable}} for dynamic content\ne.g. Your AWB {{awb}} is out for delivery."}
                  value={editing.body}
                  onChange={e => setEditing((t: any) => ({ ...t, body: e.target.value }))}
                  rows={6}
                  style={{ resize: "vertical", fontFamily: "inherit" }}
                />
                <p style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 5 }}>
                  Available variables: <code>{"{{awb}}"}</code> <code>{"{{sender}}"}</code> <code>{"{{receiver}}"}</code> <code>{"{{amount}}"}</code> <code>{"{{date}}"}</code> <code>{"{{trackUrl}}"}</code>
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
              <button onClick={() => setEditing(null)} style={{
                padding: "8px 16px", borderRadius: 7, border: "1px solid var(--border)",
                background: "white", fontSize: 12.5, fontWeight: 500, cursor: "pointer",
              }}>Cancel</button>
              <button onClick={saveTemplate} disabled={saving} style={{
                padding: "8px 18px", borderRadius: 7, border: "none",
                background: "var(--brand-red)", color: "white",
                fontSize: 12.5, fontWeight: 600, cursor: "pointer",
              }}>
                {saving ? "Saving…" : "Save Template"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const lbl: React.CSSProperties = {
  display: "block", fontSize: 11.5, fontWeight: 600,
  color: "var(--text-muted)", marginBottom: 5,
};

const iconBtn: React.CSSProperties = {
  width: 30, height: 30, border: "1px solid var(--border)",
  borderRadius: 6, background: "white", cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
};
