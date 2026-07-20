"use client";

import { useState, useEffect } from "react";
import {
  Globe, Building2, Truck, Package,
  Settings2, ListTodo, CreditCard, RefreshCw, CheckCircle2,
} from "lucide-react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type Tab = "zones" | "banks" | "vehicles" | "packaging" | "services" | "expenses";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "zones",    label: "Delivery Zones",       icon: Globe },
  { id: "banks",    label: "Banks",                icon: Building2 },
  { id: "vehicles", label: "Vehicle Types",        icon: Truck },
  { id: "packaging",label: "Packaging Types",      icon: Package },
  { id: "services", label: "Service Types",        icon: Settings2 },
  { id: "expenses", label: "Expense Categories",   icon: ListTodo },
];

// ─────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────
export default function MasterDataPage() {
  const [tab, setTab] = useState<Tab>("zones");
  const [seeding, setSeeding] = useState(false);
  const [seeded, setSeeded] = useState(false);

  const handleSeed = async () => {
    setSeeding(true);
    await fetch("/api/master-data/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "seed" }),
    });
    setSeeding(false);
    setSeeded(true);
    setTimeout(() => setSeeded(false), 3000);
  };

  return (
    <div className="page-container" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Page header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4 }}>Master Data</h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
            Configure zones, banks, vehicle types, packaging, service types, and expense categories.
          </p>
        </div>
        <button
          onClick={handleSeed}
          disabled={seeding}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 14px", borderRadius: 7,
            background: "white", border: "1px solid var(--border)",
            fontSize: 12.5, fontWeight: 600, cursor: "pointer",
            color: seeded ? "#15803D" : "var(--text-primary)",
            boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
          }}
        >
          {seeded
            ? <><CheckCircle2 size={13} color="#15803D" /> Defaults Loaded</>
            : <><RefreshCw size={13} style={{ animation: seeding ? "spin 1s linear infinite" : "none" }} /> Load Defaults</>
          }
        </button>
      </div>

      {/* Tab nav */}
      <div style={{
        display: "flex", gap: 2,
        background: "var(--bg-muted)",
        borderRadius: 9, padding: 4,
        border: "1px solid var(--border)",
        width: "fit-content",
      }}>
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 13px", borderRadius: 7,
                border: "none", background: active ? "white" : "transparent",
                color: active ? "var(--text-primary)" : "var(--text-muted)",
                fontSize: 12.5, fontWeight: active ? 600 : 500,
                cursor: "pointer",
                boxShadow: active ? "0 1px 3px rgba(0,0,0,0.07)" : "none",
                transition: "all 0.15s ease",
              }}
            >
              <Icon size={13} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {tab === "zones"    && <ZonesTab />}
      {tab === "banks"    && <BanksTab />}
      {tab === "vehicles" && <VehiclesTab />}
      {tab === "packaging" && <PackagingTab />}
      {tab === "services" && <ServicesTab />}
      {tab === "expenses" && <ExpensesTab />}
    </div>
  );
}

// ─────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────
const card: React.CSSProperties = {
  background: "white", border: "1px solid var(--border)",
  borderRadius: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  overflow: "hidden",
};

function TableHeader({ columns }: { columns: string[] }) {
  return (
    <tr style={{ fontSize: 10.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", borderBottom: "1px solid var(--border-subtle)" }}>
      {columns.map((c, i) => (
        <th key={i} style={{ padding: "9px 16px", textAlign: "left", fontWeight: 600 }}>{c}</th>
      ))}
    </tr>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 5,
      background: active ? "#ECFDF5" : "#F3F4F6",
      color: active ? "#15803D" : "#6B7280",
    }}>
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function EmptyRow({ colSpan, message }: { colSpan: number; message: string }) {
  return (
    <tr><td colSpan={colSpan} style={{ padding: "36px 0", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>{message}</td></tr>
  );
}

// ─────────────────────────────────────────────
// ZONES TAB
// ─────────────────────────────────────────────
function ZonesTab() {
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ code: "", name: "", description: "" });
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const load = async () => {
    try {
      const res = await fetch("/api/master-data/zones");
      const d = await res.json();
      if (d.error) { setError(d.error); setLoading(false); return; }
      setZones(d.zones || []);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/master-data/zones", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setForm({ code: "", name: "", description: "" });
    setSaving(false);
    load();
  };

  const toggle = async (zone: any) => {
    await fetch("/api/master-data/zones", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: zone.id, isActive: !zone.isActive }) });
    load();
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 14 }}>
      <div style={{ ...card, padding: "18px 20px" }}>
        <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, paddingBottom: 12, borderBottom: "1px solid var(--border-subtle)" }}>Add Zone</h4>
        <form onSubmit={save} style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          <div><label style={lbl}>Zone Code</label><input className="form-input" placeholder="e.g. A, B, C" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} required /></div>
          <div><label style={lbl}>Zone Name</label><input className="form-input" placeholder="e.g. Metro" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
          <div><label style={lbl}>Description</label><input className="form-input" placeholder="Cities covered…" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          <button type="submit" disabled={saving} className="btn btn-primary" style={{ marginTop: 4 }}>{saving ? "Saving…" : "Add Zone"}</button>
        </form>
      </div>
      <div style={card}>
        <div style={{ padding: "13px 18px", borderBottom: "1px solid var(--border)" }}>
          <span style={{ fontSize: 13.5, fontWeight: 700 }}>Delivery Zones</span>
          <span style={countBadge}>{zones.length}</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><TableHeader columns={["Code", "Name", "Description", "Pincodes", "Rate Slabs", "Status", "Action"]} /></thead>
          <tbody>
            {error
              ? <EmptyRow colSpan={7} message={`Error: ${error}`} />
              : loading
              ? <EmptyRow colSpan={7} message="Loading…" />
              : zones.length === 0
                ? <EmptyRow colSpan={7} message="No zones yet. Add one or click Load Defaults." />
                : zones.map(z => (
                  <tr key={z.id} style={{ borderBottom: "1px solid var(--border-subtle)", fontSize: 13 }}>
                    <td style={{ padding: "11px 16px" }}><span style={{ fontFamily: "monospace", fontWeight: 800, fontSize: 14 }}>{z.code}</span></td>
                    <td style={{ padding: "11px 16px", fontWeight: 600 }}>{z.name}</td>
                    <td style={{ padding: "11px 16px", color: "var(--text-muted)", fontSize: 12.5 }}>{z.description || "—"}</td>
                    <td style={{ padding: "11px 16px", color: "var(--text-muted)" }}>{z._count?.pincodes ?? 0}</td>
                    <td style={{ padding: "11px 16px", color: "var(--text-muted)" }}>{z._count?.rateSlabs ?? 0}</td>
                    <td style={{ padding: "11px 16px" }}><StatusBadge active={z.isActive} /></td>
                    <td style={{ padding: "11px 16px" }}>
                      <button onClick={() => toggle(z)} style={actionBtn}>{z.isActive ? "Deactivate" : "Activate"}</button>
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// BANKS TAB
// ─────────────────────────────────────────────
function BanksTab() {
  const [banks, setBanks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", accountNumber: "", ifscCode: "", branchName: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const res = await fetch("/api/master-data/banks");
    const d = await res.json();
    setBanks(d.banks || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/master-data/banks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setForm({ name: "", accountNumber: "", ifscCode: "", branchName: "" });
    setSaving(false);
    load();
  };

  const toggle = async (bank: any) => {
    await fetch("/api/master-data/banks", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: bank.id, isActive: !bank.isActive }) });
    load();
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 14 }}>
      <div style={{ ...card, padding: "18px 20px" }}>
        <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, paddingBottom: 12, borderBottom: "1px solid var(--border-subtle)" }}>Add Bank</h4>
        <form onSubmit={save} style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          <div><label style={lbl}>Bank Name</label><input className="form-input" placeholder="e.g. SBI" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
          <div><label style={lbl}>Account Number</label><input className="form-input" placeholder="Optional" value={form.accountNumber} onChange={e => setForm(f => ({ ...f, accountNumber: e.target.value }))} /></div>
          <div><label style={lbl}>IFSC Code</label><input className="form-input" placeholder="SBIN0001234" value={form.ifscCode} onChange={e => setForm(f => ({ ...f, ifscCode: e.target.value }))} /></div>
          <div><label style={lbl}>Branch Name</label><input className="form-input" placeholder="e.g. Connaught Place" value={form.branchName} onChange={e => setForm(f => ({ ...f, branchName: e.target.value }))} /></div>
          <button type="submit" disabled={saving} className="btn btn-primary" style={{ marginTop: 4 }}>{saving ? "Saving…" : "Add Bank"}</button>
        </form>
      </div>
      <div style={card}>
        <div style={{ padding: "13px 18px", borderBottom: "1px solid var(--border)" }}>
          <span style={{ fontSize: 13.5, fontWeight: 700 }}>Banks</span>
          <span style={countBadge}>{banks.length}</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><TableHeader columns={["Bank Name", "Account Number", "IFSC Code", "Branch", "Status", "Action"]} /></thead>
          <tbody>
            {loading
              ? <EmptyRow colSpan={6} message="Loading…" />
              : banks.length === 0
                ? <EmptyRow colSpan={6} message="No banks added yet." />
                : banks.map(b => (
                  <tr key={b.id} style={{ borderBottom: "1px solid var(--border-subtle)", fontSize: 13 }}>
                    <td style={{ padding: "11px 16px", fontWeight: 600 }}>{b.name}</td>
                    <td style={{ padding: "11px 16px", fontFamily: "monospace", color: "var(--text-muted)" }}>{b.accountNumber || "—"}</td>
                    <td style={{ padding: "11px 16px", fontFamily: "monospace" }}>{b.ifscCode || "—"}</td>
                    <td style={{ padding: "11px 16px", color: "var(--text-muted)" }}>{b.branchName || "—"}</td>
                    <td style={{ padding: "11px 16px" }}><StatusBadge active={b.isActive} /></td>
                    <td style={{ padding: "11px 16px" }}><button onClick={() => toggle(b)} style={actionBtn}>{b.isActive ? "Deactivate" : "Activate"}</button></td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// VEHICLES TAB
// ─────────────────────────────────────────────
function VehiclesTab() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const res = await fetch("/api/master-data/vehicles");
    const d = await res.json();
    setVehicles(d.vehicles || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/master-data/vehicles", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setForm({ name: "", description: "" });
    setSaving(false);
    load();
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 14 }}>
      <div style={{ ...card, padding: "18px 20px" }}>
        <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, paddingBottom: 12, borderBottom: "1px solid var(--border-subtle)" }}>Add Vehicle Type</h4>
        <form onSubmit={save} style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          <div><label style={lbl}>Name</label><input className="form-input" placeholder="e.g. Bike, Van" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
          <div><label style={lbl}>Description</label><input className="form-input" placeholder="Optional" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          <button type="submit" disabled={saving} className="btn btn-primary" style={{ marginTop: 4 }}>{saving ? "Saving…" : "Add Vehicle"}</button>
        </form>
      </div>
      <div style={card}>
        <div style={{ padding: "13px 18px", borderBottom: "1px solid var(--border)" }}>
          <span style={{ fontSize: 13.5, fontWeight: 700 }}>Vehicle Types</span>
          <span style={countBadge}>{vehicles.length}</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><TableHeader columns={["Name", "Description", "Status"]} /></thead>
          <tbody>
            {loading ? <EmptyRow colSpan={3} message="Loading…" />
              : vehicles.length === 0 ? <EmptyRow colSpan={3} message="No vehicle types. Click Load Defaults." />
                : vehicles.map(v => (
                  <tr key={v.id} style={{ borderBottom: "1px solid var(--border-subtle)", fontSize: 13 }}>
                    <td style={{ padding: "11px 16px", fontWeight: 600 }}>{v.name}</td>
                    <td style={{ padding: "11px 16px", color: "var(--text-muted)" }}>{v.description || "—"}</td>
                    <td style={{ padding: "11px 16px" }}><StatusBadge active={v.isActive} /></td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PACKAGING TAB
// ─────────────────────────────────────────────
function PackagingTab() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", description: "", dimensions: "", maxWeightKg: "", priceAddOn: "0" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const res = await fetch("/api/master-data/vehicles?type=packaging");
    const d = await res.json();
    setItems(d.packaging || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/master-data/vehicles", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "packaging", ...form, maxWeightKg: form.maxWeightKg ? Number(form.maxWeightKg) : undefined, priceAddOn: Number(form.priceAddOn) }),
    });
    setForm({ name: "", description: "", dimensions: "", maxWeightKg: "", priceAddOn: "0" });
    setSaving(false);
    load();
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 14 }}>
      <div style={{ ...card, padding: "18px 20px" }}>
        <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, paddingBottom: 12, borderBottom: "1px solid var(--border-subtle)" }}>Add Packaging Type</h4>
        <form onSubmit={save} style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          <div><label style={lbl}>Name</label><input className="form-input" placeholder="e.g. Small Box" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
          <div><label style={lbl}>Description</label><input className="form-input" placeholder="Optional" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          <div><label style={lbl}>Dimensions</label><input className="form-input" placeholder="30×20×10 cm" value={form.dimensions} onChange={e => setForm(f => ({ ...f, dimensions: e.target.value }))} /></div>
          <div><label style={lbl}>Max Weight (kg)</label><input type="number" className="form-input" placeholder="5" value={form.maxWeightKg} onChange={e => setForm(f => ({ ...f, maxWeightKg: e.target.value }))} /></div>
          <div><label style={lbl}>Price Add-on (₹)</label><input type="number" className="form-input" placeholder="0" value={form.priceAddOn} onChange={e => setForm(f => ({ ...f, priceAddOn: e.target.value }))} /></div>
          <button type="submit" disabled={saving} className="btn btn-primary" style={{ marginTop: 4 }}>{saving ? "Saving…" : "Add Type"}</button>
        </form>
      </div>
      <div style={card}>
        <div style={{ padding: "13px 18px", borderBottom: "1px solid var(--border)" }}>
          <span style={{ fontSize: 13.5, fontWeight: 700 }}>Packaging Types</span>
          <span style={countBadge}>{items.length}</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><TableHeader columns={["Name", "Dimensions", "Max Weight", "Price Add-on", "Status"]} /></thead>
          <tbody>
            {loading ? <EmptyRow colSpan={5} message="Loading…" />
              : items.length === 0 ? <EmptyRow colSpan={5} message="No packaging types. Click Load Defaults." />
                : items.map(p => (
                  <tr key={p.id} style={{ borderBottom: "1px solid var(--border-subtle)", fontSize: 13 }}>
                    <td style={{ padding: "11px 16px", fontWeight: 600 }}>{p.name}</td>
                    <td style={{ padding: "11px 16px", color: "var(--text-muted)" }}>{p.dimensions || "—"}</td>
                    <td style={{ padding: "11px 16px", color: "var(--text-muted)" }}>{p.maxWeightKg ? `${p.maxWeightKg} kg` : "—"}</td>
                    <td style={{ padding: "11px 16px" }}>{p.priceAddOn > 0 ? `+₹${p.priceAddOn}` : <span style={{ color: "var(--text-subtle)" }}>None</span>}</td>
                    <td style={{ padding: "11px 16px" }}><StatusBadge active={p.isActive} /></td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SERVICE TYPES TAB
// ─────────────────────────────────────────────
function ServicesTab() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const res = await fetch("/api/master-data/config?section=services");
    const d = await res.json();
    setServices(d.serviceTypes || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  return (
    <div style={card}>
      <div style={{ padding: "13px 18px", borderBottom: "1px solid var(--border)" }}>
        <span style={{ fontSize: 13.5, fontWeight: 700 }}>Service Type Configuration</span>
        <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 10 }}>Rate multipliers applied during freight calculation</span>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><TableHeader columns={["Code", "Name", "Transit Days", "Rate Multiplier", "Status"]} /></thead>
        <tbody>
          {loading ? <EmptyRow colSpan={5} message="Loading…" />
            : services.length === 0 ? <EmptyRow colSpan={5} message="No service types. Click Load Defaults." />
              : services.map(s => (
                <tr key={s.id} style={{ borderBottom: "1px solid var(--border-subtle)", fontSize: 13 }}>
                  <td style={{ padding: "11px 16px" }}><span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 12 }}>{s.code}</span></td>
                  <td style={{ padding: "11px 16px", fontWeight: 600 }}>{s.name}</td>
                  <td style={{ padding: "11px 16px", color: "var(--text-muted)" }}>{s.transitDays} day{s.transitDays !== 1 ? "s" : ""}</td>
                  <td style={{ padding: "11px 16px" }}><span style={{ fontFamily: "monospace", fontWeight: 600 }}>{s.multiplier}×</span></td>
                  <td style={{ padding: "11px 16px" }}><StatusBadge active={s.isActive} /></td>
                </tr>
              ))
          }
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────
// EXPENSE CATEGORIES TAB
// ─────────────────────────────────────────────
function ExpensesTab() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const res = await fetch("/api/master-data/config?section=expenses");
    const d = await res.json();
    setCategories(d.expenseCategories || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const toggle = async (c: any) => {
    await fetch("/api/master-data/config", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: c.id, entityType: "expenseCategory", isActive: !c.isActive }),
    });
    load();
  };

  return (
    <div style={card}>
      <div style={{ padding: "13px 18px", borderBottom: "1px solid var(--border)" }}>
        <span style={{ fontSize: 13.5, fontWeight: 700 }}>Expense Categories</span>
        <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 10 }}>Control which categories appear in expense forms</span>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><TableHeader columns={["Code", "Category Name", "Status", "Action"]} /></thead>
        <tbody>
          {loading ? <EmptyRow colSpan={4} message="Loading…" />
            : categories.length === 0 ? <EmptyRow colSpan={4} message="No categories. Click Load Defaults." />
              : categories.map(c => (
                <tr key={c.id} style={{ borderBottom: "1px solid var(--border-subtle)", fontSize: 13 }}>
                  <td style={{ padding: "11px 16px" }}><span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 12 }}>{c.code}</span></td>
                  <td style={{ padding: "11px 16px", fontWeight: 500 }}>{c.name}</td>
                  <td style={{ padding: "11px 16px" }}><StatusBadge active={c.isActive} /></td>
                  <td style={{ padding: "11px 16px" }}><button onClick={() => toggle(c)} style={actionBtn}>{c.isActive ? "Disable" : "Enable"}</button></td>
                </tr>
              ))
          }
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────
// Shared style tokens
// ─────────────────────────────────────────────
const lbl: React.CSSProperties = {
  display: "block", fontSize: 11.5, fontWeight: 600,
  color: "var(--text-muted)", marginBottom: 5,
};

const actionBtn: React.CSSProperties = {
  background: "white", border: "1px solid var(--border)",
  borderRadius: 6, padding: "4px 10px",
  fontSize: 12, fontWeight: 600, cursor: "pointer",
  color: "var(--text-primary)",
};

const countBadge: React.CSSProperties = {
  display: "inline-block",
  background: "var(--bg-muted)",
  color: "var(--text-muted)",
  fontSize: 11, fontWeight: 700,
  padding: "2px 8px", borderRadius: 99,
  marginLeft: 8,
};
