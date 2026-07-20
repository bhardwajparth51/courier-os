"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2, Bell, ShieldCheck, FileText, CheckCircle2, Save,
} from "lucide-react";

const SETTING_GROUPS = [
  {
    title: "Branch Profile",
    desc: "Basic identification info displayed on customer invoices, consignment labels, and waybills.",
    fields: [
      { key: "invoice_prefix", label: "Invoice Number Prefix", placeholder: "INV", hint: "e.g. INV → INV-2026-001" },
      { key: "awb_prefix",     label: "AWB Number Prefix",     placeholder: "AWB", hint: "e.g. AWB → AWB-110001-001" },
    ],
  },
  {
    title: "Regional Settings",
    desc: "Localization parameters for currency formatting, date display, and operational timezone.",
    fields: [
      { key: "timezone",    label: "Timezone",    placeholder: "Asia/Kolkata" },
      { key: "currency",    label: "Currency",    placeholder: "INR" },
      { key: "language",    label: "Language",    placeholder: "en-IN" },
      { key: "date_format", label: "Date Format", placeholder: "DD/MM/YYYY", hint: "DD/MM/YYYY or YYYY-MM-DD" },
    ],
  },
  {
    title: "Thermal Printer",
    desc: "Configure media size and label dimensions for 880Hz thermal barcode printers.",
    fields: [
      { key: "thermal_printer_width", label: "Printer Width (mm)", placeholder: "76", hint: "Common: 58, 76, 80, 100 mm" },
    ],
  },
  {
    title: "Email (SMTP Server)",
    desc: "Outgoing mail server configuration for dispatching automated invoices and receipts.",
    fields: [
      { key: "smtp_host", label: "SMTP Host",    placeholder: "smtp.gmail.com" },
      { key: "smtp_port", label: "SMTP Port",    placeholder: "587" },
      { key: "smtp_user", label: "SMTP Username / Email", placeholder: "yourname@gmail.com" },
      { key: "smtp_from", label: "From Name",    placeholder: "DTDC Franchise" },
    ],
    sensitive: [{ key: "smtp_pass", label: "SMTP Password", placeholder: "App password" }],
  },
  {
    title: "SMS Gateway",
    desc: "Gateway credentials for sending transactional SMS notifications to senders & receivers.",
    fields: [
      { key: "sms_provider", label: "SMS Provider", placeholder: "mock", hint: "mock | msg91 | twilio" },
      { key: "sms_api_key",  label: "API Key",      placeholder: "Enter provider API key" },
    ],
  },
  {
    title: "WhatsApp Business API",
    desc: "Integration details for sending WhatsApp tracking alerts via Meta Cloud API or MSG91.",
    fields: [
      { key: "whatsapp_provider",           label: "WhatsApp Provider",       placeholder: "mock", hint: "mock | msg91 | meta | interakt" },
      { key: "whatsapp_phone_number_id",    label: "Phone Number ID",          placeholder: "e.g. 10984019283746" },
      { key: "whatsapp_business_account_id",label: "WABA ID",                  placeholder: "e.g. 20984019283746" },
      { key: "whatsapp_access_token",       label: "Permanent Access Token",   placeholder: "EAAG..." },
    ],
  },
];


export default function CompanySettingsPage() {
  const pathname = usePathname();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings/system")
      .then((r) => r.json())
      .then((d) => {
        setSettings(d.settings || {});
        setLoading(false);
      });
  }, []);

  const update = (key: string, value: string) =>
    setSettings((s) => ({ ...s, [key]: value }));

  const save = async () => {
    setSaving(true);
    await fetch("/api/settings/system", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (loading)
    return (
      <div className="page-container">
        <p style={{ fontSize: 13, color: "var(--text-muted)", padding: "20px 0" }}>
          Loading branch configuration…
        </p>
      </div>
    );

  return (
    <div className="page-container" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
            Settings
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
            Manage branch details, regional defaults, integrations, and security.
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="btn btn-primary"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 18px",
            fontSize: 13,
            fontWeight: 600,
            background: saved ? "#166534" : "var(--brand-red)",
            color: "white",
            transition: "all 0.2s ease",
          }}
        >
          {saved ? (
            <>
              <CheckCircle2 size={15} /> Saved
            </>
          ) : (
            <>
              <Save size={15} /> {saving ? "Saving…" : "Save Changes"}
            </>
          )}
        </button>
      </div>

      {/* Sub-Navigation Tabs */}
      <div style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--border)", paddingBottom: 2 }}>
        {[
          { href: "/owner/settings/company", label: "Branch Profile", icon: Building2 },
          { href: "/owner/settings/notifications", label: "Notifications", icon: Bell },
          { href: "/owner/settings/security", label: "Security & Roles", icon: ShieldCheck },
          { href: "/owner/settings/audit", label: "Audit Trail", icon: FileText },
        ].map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: active ? 600 : 500,
                color: active ? "var(--text-primary)" : "var(--text-muted)",
                background: active ? "var(--bg-muted)" : "transparent",
                textDecoration: "none",
                transition: "all 0.15s ease",
              }}
            >
              <Icon size={14} color={active ? "var(--text-primary)" : "var(--text-muted)"} />
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* 2-Column Setting Groups */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {SETTING_GROUPS.map((group) => (
          <div
            key={group.title}
            style={{
              display: "grid",
              gridTemplateColumns: "300px 1fr",
              gap: 36,
              padding: "28px 0",
              borderBottom: "1px solid var(--border-subtle)",
            }}
          >
            {/* Left Column: Section Title & Description */}
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
                {group.title}
              </h3>
              <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 6, lineHeight: 1.5 }}>
                {group.desc}
              </p>
            </div>

            {/* Right Column: Clean White Form Card */}
            <div className="card" style={{ padding: "22px 26px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px" }}>
                {group.fields.map((f) => (
                  <div key={f.key}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>
                      {f.label}
                    </label>
                    <input
                      className="input"
                      placeholder={f.placeholder}
                      value={settings[f.key] ?? ""}
                      onChange={(e) => update(f.key, e.target.value)}
                      style={{ height: 38, fontSize: 13, background: "#FAFAFA" }}
                    />
                    {f.hint && <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{f.hint}</p>}
                  </div>
                ))}
                {group.sensitive?.map((f) => (
                  <div key={f.key}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>
                      {f.label}
                    </label>
                    <input
                      type="password"
                      className="input"
                      placeholder={f.placeholder}
                      value={settings[f.key] ?? ""}
                      onChange={(e) => update(f.key, e.target.value)}
                      style={{ height: 38, fontSize: 13, background: "#FAFAFA" }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
