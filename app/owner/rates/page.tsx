"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Calculator, Zap, Settings2, CheckCircle2, RefreshCw,
  Plus, Trash2, ChevronDown, ChevronUp,
} from "lucide-react";

type Tab = "cards" | "calculator" | "surcharges";

const SERVICE_CODES = ["STANDARD", "EXPRESS", "SURFACE"];
const SERVICE_LABELS: Record<string, string> = {
  STANDARD: "Standard",
  EXPRESS: "Express",
  SURFACE: "Surface",
};

// ─────────────────────────────────────────────
export default function RatesPage() {
  const [tab, setTab] = useState<Tab>("cards");

  return (
    <div className="page-container" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4 }}>
          Rate Card & Pricing Engine
        </h2>
        <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
          Manage zone-wise weight slabs, surcharges, and calculate freight in real time.
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", gap: 2,
        background: "var(--bg-muted)", borderRadius: 9, padding: 4,
        border: "1px solid var(--border)", width: "fit-content",
      }}>
        {([
          { id: "cards" as Tab,       label: "Rate Cards",    icon: Settings2  },
          { id: "calculator" as Tab,  label: "Calculator",    icon: Calculator },
          { id: "surcharges" as Tab,  label: "Surcharges",    icon: Zap        },
        ]).map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "7px 14px", borderRadius: 7, border: "none",
            background: tab === id ? "white" : "transparent",
            color: tab === id ? "var(--text-primary)" : "var(--text-muted)",
            fontSize: 12.5, fontWeight: tab === id ? 600 : 500,
            cursor: "pointer",
            boxShadow: tab === id ? "0 1px 3px rgba(0,0,0,0.07)" : "none",
            transition: "all 0.15s ease",
          }}>
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {tab === "cards"      && <RateCardsTab />}
      {tab === "calculator" && <FreightCalculatorTab />}
      {tab === "surcharges" && <SurchargesTab />}
    </div>
  );
}

// ─────────────────────────────────────────────
// RATE CARDS TAB
// ─────────────────────────────────────────────
function RateCardsTab() {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [slabs, setSlabs] = useState<any[]>([]);
  const [seeding, setSeeding] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  const loadCards = async () => {
    const res = await fetch("/api/rates/slabs");
    const d = await res.json();
    setCards(d.rateCards || []);
    setLoading(false);
  };

  useEffect(() => { loadCards(); }, []);

  const loadSlabs = async (cardId: string) => {
    if (expanded === cardId) { setExpanded(null); return; }
    const res = await fetch(`/api/rates/slabs?rateCardId=${cardId}`);
    const d = await res.json();
    setSlabs(d.slabs || []);
    setExpanded(cardId);
  };

  const activate = async (id: string) => {
    await fetch("/api/rates/slabs", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "activate", id }),
    });
    loadCards();
  };

  const seed = async () => {
    setSeeding(true);
    // First seed master data, then rate card
    await fetch("/api/master-data/config", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "seed" }),
    });
    const res = await fetch("/api/rates/slabs", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "seed" }),
    });
    const d = await res.json();
    setSeeding(false);
    if (d.ok) loadCards();
    else alert(d.message);
  };

  const createCard = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    await fetch("/api/rates/slabs", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });
    setNewName("");
    setCreating(false);
    loadCards();
  };

  const deleteCard = async (id: string) => {
    if (!confirm("Delete this rate card and all its slabs?")) return;
    await fetch(`/api/rates/slabs?id=${id}`, { method: "DELETE" });
    loadCards();
  };

  // Group slabs for the expanded card
  const slabsByZoneService = slabs.reduce((acc, s) => {
    const key = `${s.zone?.code} — ${SERVICE_LABELS[s.serviceCode] ?? s.serviceCode}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Toolbar */}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <input
          className="form-input"
          placeholder="New rate card name…"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && createCard()}
          style={{ maxWidth: 260 }}
        />
        <button onClick={createCard} disabled={creating || !newName.trim()} className="btn btn-primary" style={{ gap: 5 }}>
          <Plus size={13} /> Create Card
        </button>
        <button onClick={seed} disabled={seeding} style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "8px 14px", borderRadius: 7,
          background: "white", border: "1px solid var(--border)",
          fontSize: 12.5, fontWeight: 600, cursor: "pointer",
          boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
        }}>
          <RefreshCw size={13} style={{ animation: seeding ? "spin 1s linear infinite" : "none" }} />
          {seeding ? "Seeding…" : "Load DTDC Defaults"}
        </button>
      </div>

      {/* Cards list */}
      {loading
        ? <p style={{ color: "var(--text-muted)", fontSize: 13, padding: "20px 0" }}>Loading…</p>
        : cards.length === 0
          ? (
            <div style={{ ...card, padding: "36px 24px", textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>No rate cards yet.</p>
              <button onClick={seed} disabled={seeding} className="btn btn-primary">Load DTDC Defaults</button>
            </div>
          )
          : cards.map(c => (
            <div key={c.id} style={card}>
              {/* Card header */}
              <div style={{ padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button onClick={() => loadSlabs(c.id)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                    {expanded === c.id ? <ChevronUp size={15} color="var(--text-muted)" /> : <ChevronDown size={15} color="var(--text-muted)" />}
                  </button>
                  <div>
                    <p style={{ fontSize: 13.5, fontWeight: 700, letterSpacing: "-0.01em" }}>{c.name}</p>
                    {c.description && <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{c.description}</p>}
                  </div>
                  {c.isActive && (
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 5, background: "#ECFDF5", color: "#15803D", border: "1px solid #A7F3D0" }}>
                      Active
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{c._count?.slabs ?? 0} slabs</span>
                  {!c.isActive && (
                    <button onClick={() => activate(c.id)} style={{
                      padding: "5px 12px", borderRadius: 6, border: "1px solid var(--border)",
                      background: "white", fontSize: 12, fontWeight: 600, cursor: "pointer",
                    }}>
                      Set Active
                    </button>
                  )}
                  {!c.isActive && (
                    <button onClick={() => deleteCard(c.id)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                      <Trash2 size={14} color="#DC2626" />
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded slabs */}
              {expanded === c.id && (
                <div style={{ borderTop: "1px solid var(--border)", padding: "0 20px 16px" }}>
                  {Object.entries(slabsByZoneService).map(([groupKey, groupSlabs]) => (
                    <div key={groupKey} style={{ marginTop: 16 }}>
                      <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 6 }}>
                        {groupKey}
                      </p>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                        <thead>
                          <tr style={{ color: "var(--text-muted)", fontSize: 11, borderBottom: "1px solid var(--border-subtle)" }}>
                            <th style={{ textAlign: "left", padding: "5px 10px", fontWeight: 600 }}>Weight Range</th>
                            <th style={{ textAlign: "right", padding: "5px 10px", fontWeight: 600 }}>Base Rate (₹)</th>
                            <th style={{ textAlign: "right", padding: "5px 10px", fontWeight: 600 }}>Additional / 500g</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(groupSlabs as any[]).map(s => (
                            <tr key={s.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                              <td style={{ padding: "6px 10px", color: "var(--text-secondary)" }}>
                                {(s.minWeightGrams / 1000).toFixed(2)}kg – {(s.maxWeightGrams / 1000).toFixed(2)}kg
                              </td>
                              <td style={{ padding: "6px 10px", textAlign: "right", fontFamily: "monospace", fontWeight: 600 }}>₹{s.baseRate}</td>
                              <td style={{ padding: "6px 10px", textAlign: "right", fontFamily: "monospace", color: "var(--text-muted)" }}>
                                {s.additionalRate > 0 ? `+₹${s.additionalRate}` : "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                  {slabs.length === 0 && (
                    <p style={{ fontSize: 13, color: "var(--text-muted)", padding: "20px 0" }}>No slabs in this rate card.</p>
                  )}
                </div>
              )}
            </div>
          ))
      }
    </div>
  );
}

// ─────────────────────────────────────────────
// FREIGHT CALCULATOR TAB
// ─────────────────────────────────────────────
function FreightCalculatorTab() {
  const [form, setForm] = useState({
    originPincode: "", destPincode: "", serviceCode: "STANDARD",
    weightGrams: "", declaredValue: "", codAmount: "",
    isODA: false, hasInsurance: false,
  });
  const [quote, setQuote] = useState<any>(null);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState("");

  const calculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCalculating(true);
    setError("");
    setQuote(null);

    const res = await fetch("/api/rates/calculate", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        weightGrams: Number(form.weightGrams),
        declaredValue: form.declaredValue ? Number(form.declaredValue) : 0,
        codAmount: form.codAmount ? Number(form.codAmount) : 0,
      }),
    });
    const d = await res.json();
    setCalculating(false);

    if (d.error) { setError(d.error); return; }
    setQuote(d.quote);
  };

  const f = (n: number) => `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 14 }}>
      {/* Input form */}
      <div style={{ ...card, padding: "20px 22px" }}>
        <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 16 }}>Freight Parameters</h4>
        <form onSubmit={calculate} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={lbl}>Origin Pincode</label>
            <input className="form-input" placeholder="e.g. 110001" value={form.originPincode}
              onChange={e => setForm(f => ({ ...f, originPincode: e.target.value }))} required />
          </div>
          <div>
            <label style={lbl}>Destination Pincode</label>
            <input className="form-input" placeholder="e.g. 400001" value={form.destPincode}
              onChange={e => setForm(f => ({ ...f, destPincode: e.target.value }))} required />
          </div>
          <div>
            <label style={lbl}>Service Type</label>
            <select className="form-input" value={form.serviceCode}
              onChange={e => setForm(f => ({ ...f, serviceCode: e.target.value }))}>
              {SERVICE_CODES.map(s => <option key={s} value={s}>{SERVICE_LABELS[s]}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Weight (grams)</label>
            <input type="number" className="form-input" placeholder="e.g. 500" value={form.weightGrams}
              onChange={e => setForm(f => ({ ...f, weightGrams: e.target.value }))} required min={1} />
          </div>
          <div>
            <label style={lbl}>Declared Value (₹) <span style={{ color: "var(--text-subtle)" }}>optional</span></label>
            <input type="number" className="form-input" placeholder="0" value={form.declaredValue}
              onChange={e => setForm(f => ({ ...f, declaredValue: e.target.value }))} />
          </div>
          <div>
            <label style={lbl}>COD Amount (₹) <span style={{ color: "var(--text-subtle)" }}>optional</span></label>
            <input type="number" className="form-input" placeholder="0" value={form.codAmount}
              onChange={e => setForm(f => ({ ...f, codAmount: e.target.value }))} />
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
              <input type="checkbox" checked={form.isODA} onChange={e => setForm(f => ({ ...f, isODA: e.target.checked }))} />
              ODA Area
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
              <input type="checkbox" checked={form.hasInsurance} onChange={e => setForm(f => ({ ...f, hasInsurance: e.target.checked }))} />
              Insurance
            </label>
          </div>
          {error && <p style={{ fontSize: 12.5, color: "#DC2626" }}>{error}</p>}
          <button type="submit" disabled={calculating} className="btn btn-primary" style={{ marginTop: 4 }}>
            {calculating ? "Calculating…" : "Calculate Freight"}
          </button>
        </form>
      </div>

      {/* Quote result */}
      <div style={{ ...card, padding: "20px 24px" }}>
        {!quote ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 8 }}>
            <Calculator size={28} color="var(--text-subtle)" strokeWidth={1.5} />
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Enter shipment parameters to get a freight quote.</p>
          </div>
        ) : (
          <>
            {/* Zone info */}
            <div style={{ marginBottom: 20, display: "flex", gap: 12 }}>
              <div style={{ padding: "10px 16px", background: "var(--bg-muted)", borderRadius: 8, flex: 1 }}>
                <p style={{ fontSize: 11, fontWeight: 500, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Origin Zone</p>
                <p style={{ fontSize: 22, fontWeight: 700, fontFamily: "Outfit, sans-serif", color: "var(--text-primary)" }}>
                  {quote.originZone ?? <span style={{ fontSize: 14, color: "#DC2626" }}>Not Mapped</span>}
                </p>
              </div>
              <div style={{ padding: "10px 16px", background: "var(--bg-muted)", borderRadius: 8, flex: 1 }}>
                <p style={{ fontSize: 11, fontWeight: 500, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Destination Zone</p>
                <p style={{ fontSize: 22, fontWeight: 700, fontFamily: "Outfit, sans-serif", color: "var(--text-primary)" }}>
                  {quote.destZone ?? <span style={{ fontSize: 14, color: "#DC2626" }}>Not Mapped</span>}
                </p>
              </div>
              <div style={{ padding: "10px 16px", background: "var(--bg-muted)", borderRadius: 8, flex: 1 }}>
                <p style={{ fontSize: 11, fontWeight: 500, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Weight</p>
                <p style={{ fontSize: 22, fontWeight: 700, fontFamily: "Outfit, sans-serif" }}>{(quote.weightGrams / 1000).toFixed(3)} kg</p>
              </div>
              <div style={{ padding: "10px 16px", background: "var(--bg-muted)", borderRadius: 8, flex: 1 }}>
                <p style={{ fontSize: 11, fontWeight: 500, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Service</p>
                <p style={{ fontSize: 15, fontWeight: 700, fontFamily: "Outfit, sans-serif" }}>{SERVICE_LABELS[quote.serviceCode] ?? quote.serviceCode}</p>
              </div>
            </div>

            {/* Breakdown */}
            <div style={{ border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
              {Object.entries(quote.breakdown).map(([label, amount]: [string, any], i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 16px",
                  borderBottom: i < Object.keys(quote.breakdown).length - 1 ? "1px solid var(--border-subtle)" : "none",
                  background: label.startsWith("GST") ? "var(--bg-muted)" : "white",
                }}>
                  <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{label}</span>
                  <span style={{
                    fontSize: 13, fontWeight: 600,
                    fontFamily: "'JetBrains Mono', monospace",
                    color: amount > 0 ? "var(--text-primary)" : "var(--text-subtle)",
                  }}>
                    {amount > 0 ? f(amount) : "—"}
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div style={{
              marginTop: 12, padding: "14px 18px",
              background: "#F9FAFB", borderRadius: 8, border: "1px solid var(--border)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.09em", color: "var(--text-muted)", lineHeight: 1 }}>Total Freight</p>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 5, opacity: 0.75 }}>Inclusive of GST</p>
              </div>
              <p style={{ fontSize: 28, fontWeight: 600, fontFamily: "Outfit, sans-serif", letterSpacing: "-0.03em", lineHeight: 1 }}>
                {f(quote.total)}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SURCHARGES TAB
// ─────────────────────────────────────────────
function SurchargesTab() {
  const [config, setConfig] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/rates/surcharges")
      .then(r => r.json())
      .then(d => setConfig(d.config));
  }, []);

  const save = async () => {
    setSaving(true);
    await fetch("/api/rates/surcharges", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (!config) return <p style={{ fontSize: 13, color: "var(--text-muted)", padding: "20px 0" }}>Loading surcharge configuration…</p>;

  const Field = ({ label, desc, field, suffix = "", step = "0.1" }: { label: string; desc: string; field: string; suffix?: string; step?: string }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid var(--border-subtle)" }}>
      <div>
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 3 }}>{label}</p>
        <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{desc}</p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <input
          type="number" step={step} min={0}
          value={config[field]}
          onChange={e => setConfig((c: any) => ({ ...c, [field]: Number(e.target.value) }))}
          style={{
            width: 80, textAlign: "right", padding: "6px 10px",
            border: "1px solid var(--border)", borderRadius: 7,
            fontSize: 13, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
          }}
        />
        {suffix && <span style={{ fontSize: 13, color: "var(--text-muted)", minWidth: 24 }}>{suffix}</span>}
      </div>
    </div>
  );

  return (
    <div style={{ ...card, padding: "20px 24px", maxWidth: 640 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
        <div>
          <h4 style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em" }}>Surcharge Configuration</h4>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>Applied globally to all freight calculations</p>
        </div>
        <button onClick={save} disabled={saving} style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "8px 16px", borderRadius: 7,
          background: saved ? "#ECFDF5" : "var(--brand-red)",
          border: "none", color: saved ? "#15803D" : "white",
          fontSize: 12.5, fontWeight: 600, cursor: "pointer",
          transition: "all 0.2s ease",
        }}>
          {saved ? <><CheckCircle2 size={13} /> Saved</> : saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      <Field label="Fuel Surcharge" desc="Applied as a % of base freight" field="fuelSurchargePct" suffix="%" />
      <Field label="ODA Flat Charge" desc="Fixed amount for out-of-delivery-area shipments" field="odaChargeFlat" suffix="₹" step="1" />
      <Field label="COD Charge %" desc="Percentage of COD amount collected" field="codChargePct" suffix="%" />
      <Field label="COD Minimum Fee" desc="Minimum COD handling fee regardless of %" field="codChargeMin" suffix="₹" step="1" />
      <Field label="Insurance %" desc="Percentage of declared value for insurance" field="insurancePct" suffix="%" />
      <Field label="Insurance Minimum" desc="Minimum insurance fee regardless of %" field="insuranceMin" suffix="₹" step="1" />
      <Field label="GST Rate" desc="GST applied on total freight (standard 18%)" field="gstPct" suffix="%" step="1" />
    </div>
  );
}

// ─────────────────────────────────────────────
// Shared styles
// ─────────────────────────────────────────────
const card: React.CSSProperties = {
  background: "white", border: "1px solid var(--border)",
  borderRadius: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
};

const lbl: React.CSSProperties = {
  display: "block", fontSize: 11.5, fontWeight: 600,
  color: "var(--text-muted)", marginBottom: 5,
};
