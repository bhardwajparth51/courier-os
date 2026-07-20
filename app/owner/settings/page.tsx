"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2, Bell, ShieldCheck, FileText,
  Settings2, ChevronRight,
} from "lucide-react";

const SETTINGS_SECTIONS = [
  {
    href: "/owner/settings/company",
    icon: Building2,
    label: "Branch & Company",
    desc: "Invoice prefix, AWB prefix, GST, printer settings",
  },
  {
    href: "/owner/settings/notifications",
    icon: Bell,
    label: "Notification Templates",
    desc: "SMS, WhatsApp, and Email templates with variables",
  },
  {
    href: "/owner/settings/security",
    icon: ShieldCheck,
    label: "Security & Users",
    desc: "Roles, permissions, user management, security logs",
  },
  {
    href: "/owner/settings/audit",
    icon: FileText,
    label: "Audit Logs",
    desc: "Full trail of changes to shipments, finance, and settings",
  },
];

export default function SettingsPage() {
  return (
    <div className="page-container" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4 }}>
          Settings
        </h2>
        <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
          Configure your branch profile, notifications, security, and audit trail.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {SETTINGS_SECTIONS.map(({ href, icon: Icon, label, desc }) => (
          <Link key={href} href={href} style={{ textDecoration: "none" }}>
            <div style={{
              background: "white", border: "1px solid var(--border)",
              borderRadius: 10, padding: "20px 22px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              display: "flex", alignItems: "center", gap: 16,
              cursor: "pointer",
              transition: "box-shadow 0.15s ease",
            }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 14px rgba(0,0,0,0.08)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)"}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 9,
                background: "var(--bg-muted)", border: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <Icon size={18} color="var(--text-secondary)" strokeWidth={1.8} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.01em", marginBottom: 3 }}>
                  {label}
                </p>
                <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>{desc}</p>
              </div>
              <ChevronRight size={15} color="var(--text-subtle)" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
