"use client";

import { useState, useEffect } from "react";
import { Users, Shield, Clock } from "lucide-react";

type Section = "users" | "roles" | "logs";

const MODULES = [
  "bookings", "customers", "finance", "reports",
  "dispatch", "settings", "rates", "master-data",
  "employees", "audit",
];

const ROLES = ["OWNER", "MANAGER", "COUNTER_STAFF", "DELIVERY_STAFF", "ACCOUNTS", "READ_ONLY", "EMPLOYEE"];

const ROLE_LABELS: Record<string, string> = {
  OWNER:          "Owner",
  MANAGER:        "Manager",
  COUNTER_STAFF:  "Counter Staff",
  DELIVERY_STAFF: "Delivery Staff",
  ACCOUNTS:       "Accounts",
  READ_ONLY:      "Read Only",
  EMPLOYEE:       "Employee (legacy)",
  CUSTOMER:       "Customer",
};

const EVENT_COLORS: Record<string, string> = {
  LOGIN:            "#16A34A",
  FAILED_LOGIN:     "#DC2626",
  LOGOUT:           "#9CA3AF",
  PASSWORD_CHANGED: "#D97706",
  ROLE_CHANGED:     "#7C3AED",
  USER_CREATED:     "#2563EB",
  USER_DISABLED:    "#DC2626",
  TWO_FA_ENABLED:   "#16A34A",
};

export default function SecurityPage() {
  const [section, setSection] = useState<Section>("users");

  return (
    <div className="page-container" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <h2 style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4 }}>Security & Users</h2>
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Manage users, role permissions, and security event logs.</p>
      </div>

      {/* Tab strip */}
      <div style={{ display: "flex", gap: 2, background: "var(--bg-muted)", borderRadius: 9, padding: 4, border: "1px solid var(--border)", width: "fit-content" }}>
        {([
          { id: "users" as Section, label: "Users",       icon: Users  },
          { id: "roles" as Section, label: "Permissions",  icon: Shield },
          { id: "logs"  as Section, label: "Security Logs",icon: Clock  },
        ]).map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setSection(id)} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "7px 13px", borderRadius: 7, border: "none",
            background: section === id ? "white" : "transparent",
            color: section === id ? "var(--text-primary)" : "var(--text-muted)",
            fontSize: 12.5, fontWeight: section === id ? 600 : 500,
            cursor: "pointer",
            boxShadow: section === id ? "0 1px 3px rgba(0,0,0,0.07)" : "none",
            transition: "all 0.15s ease",
          }}>
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {section === "users" && <UsersTab />}
      {section === "roles" && <RolesTab />}
      {section === "logs"  && <SecurityLogsTab />}
    </div>
  );
}

// ─────────────────────────────────────────────
// USERS TAB
// ─────────────────────────────────────────────
function UsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const res = await fetch("/api/settings/security?section=users");
    const d = await res.json();
    setUsers(d.users || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const changeRole = async (userId: string, role: string) => {
    await fetch("/api/settings/security", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "updateRole", userId, role }),
    });
    load();
  };

  const deactivate = async (userId: string) => {
    if (!confirm("Deactivate this user?")) return;
    await fetch("/api/settings/security", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "deactivate", userId }),
    });
    load();
  };

  return (
    <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
      <div style={{ padding: "13px 18px", borderBottom: "1px solid var(--border)" }}>
        <span style={{ fontSize: 13.5, fontWeight: 700 }}>System Users</span>
        <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 8 }}>{users.length} total</span>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ fontSize: 10.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", borderBottom: "1px solid var(--border-subtle)" }}>
            {["Name", "Email", "Current Role", "Staff ID", "Status", "Change Role", "Action"].map((h, i) => (
              <th key={i} style={{ padding: "9px 16px", textAlign: "left", fontWeight: 600 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading
            ? <tr><td colSpan={7} style={{ padding: "32px", textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>Loading…</td></tr>
            : users.length === 0
              ? <tr><td colSpan={7} style={{ padding: "32px", textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>No users found.</td></tr>
              : users.map(u => (
                <tr key={u.id} style={{ borderBottom: "1px solid var(--border-subtle)", fontSize: 13 }}>
                  <td style={{ padding: "11px 16px", fontWeight: 600 }}>{u.name ?? "—"}</td>
                  <td style={{ padding: "11px 16px", color: "var(--text-muted)", fontSize: 12 }}>{u.email}</td>
                  <td style={{ padding: "11px 16px" }}>
                    <span style={{ fontSize: 11.5, fontWeight: 600, padding: "2px 8px", borderRadius: 5, background: "var(--bg-muted)", color: "var(--text-secondary)" }}>
                      {ROLE_LABELS[u.role] ?? u.role}
                    </span>
                  </td>
                  <td style={{ padding: "11px 16px", fontFamily: "monospace", fontSize: 12, color: "var(--text-muted)" }}>
                    {u.employee?.staffId ?? "—"}
                  </td>
                  <td style={{ padding: "11px 16px" }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 5,
                      background: u.employee?.isActive !== false ? "#ECFDF5" : "#FEF2F2",
                      color: u.employee?.isActive !== false ? "#15803D" : "#DC2626",
                    }}>
                      {u.employee?.isActive !== false ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td style={{ padding: "11px 16px" }}>
                    <select
                      value={u.role}
                      onChange={e => changeRole(u.id, e.target.value)}
                      style={{ fontSize: 12, padding: "4px 8px", borderRadius: 6, border: "1px solid var(--border)", background: "white" }}
                    >
                      {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r] ?? r}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: "11px 16px" }}>
                    {u.employee?.isActive !== false && (
                      <button onClick={() => deactivate(u.id)} style={{
                        padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 500,
                        border: "1px solid #FCA5A5", background: "#FEF2F2", color: "#DC2626", cursor: "pointer",
                      }}>
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))
          }
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────
// ROLES / PERMISSIONS TAB
// ─────────────────────────────────────────────
function RolesTab() {
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [activeRole, setActiveRole] = useState("MANAGER");

  const load = async () => {
    const res = await fetch("/api/settings/security?section=roles");
    const d = await res.json();
    setPermissions(d.permissions || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const seed = async () => {
    setSeeding(true);
    await fetch("/api/settings/security", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "seedPermissions" }),
    });
    setSeeding(false);
    load();
  };

  const toggle = async (role: string, module: string, field: "canRead" | "canWrite" | "canDelete", current: boolean) => {
    if (role === "OWNER") return; // Owner always has all
    await fetch("/api/settings/security", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "updatePermission", role, module, perms: { [field]: !current } }),
    });
    load();
  };

  const permMap = permissions.reduce((acc, p) => {
    if (!acc[p.role]) acc[p.role] = {};
    acc[p.role][p.module] = p;
    return acc;
  }, {} as Record<string, Record<string, any>>);

  const rolesWithPermissions = ROLES.filter(r => r !== "CUSTOMER");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {rolesWithPermissions.map(r => (
            <button key={r} onClick={() => setActiveRole(r)} style={{
              padding: "5px 12px", borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer",
              border: activeRole === r ? "1px solid var(--brand-red)" : "1px solid var(--border)",
              background: activeRole === r ? "#FFF0F0" : "white",
              color: activeRole === r ? "var(--brand-red)" : "var(--text-secondary)",
            }}>
              {ROLE_LABELS[r]}
            </button>
          ))}
        </div>
        <button onClick={seed} disabled={seeding} style={{
          padding: "6px 14px", borderRadius: 7, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
          border: "1px solid var(--border)", background: "white",
        }}>
          {seeding ? "Loading…" : "Load Defaults"}
        </button>
      </div>

      <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--border)" }}>
          <span style={{ fontSize: 13.5, fontWeight: 700 }}>{ROLE_LABELS[activeRole]}</span>
          <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 8 }}>permissions</span>
          {activeRole === "OWNER" && <span style={{ fontSize: 12, color: "#15803D", marginLeft: 8 }}>Full access — not editable</span>}
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ fontSize: 10.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", borderBottom: "1px solid var(--border-subtle)" }}>
              <th style={{ padding: "9px 18px", textAlign: "left", fontWeight: 600 }}>Module</th>
              <th style={{ padding: "9px 16px", textAlign: "center", fontWeight: 600 }}>Read</th>
              <th style={{ padding: "9px 16px", textAlign: "center", fontWeight: 600 }}>Write</th>
              <th style={{ padding: "9px 16px", textAlign: "center", fontWeight: 600 }}>Delete</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? <tr><td colSpan={4} style={{ padding: "24px", textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>Loading…</td></tr>
              : MODULES.map(mod => {
                const perm = permMap[activeRole]?.[mod];
                return (
                  <tr key={mod} style={{ borderBottom: "1px solid var(--border-subtle)", fontSize: 13 }}>
                    <td style={{ padding: "10px 18px", fontWeight: 500, textTransform: "capitalize" }}>
                      {mod.replace("-", " ")}
                    </td>
                    {(["canRead", "canWrite", "canDelete"] as const).map(field => (
                      <td key={field} style={{ padding: "10px 16px", textAlign: "center" }}>
                        <button
                          onClick={() => toggle(activeRole, mod, field, perm?.[field] ?? false)}
                          disabled={activeRole === "OWNER"}
                          style={{
                            width: 22, height: 22, borderRadius: 4,
                            border: (perm?.[field] || activeRole === "OWNER")
                              ? "1.5px solid var(--brand-red)"
                              : "1.5px solid var(--border)",
                            background: (perm?.[field] || activeRole === "OWNER") ? "var(--brand-red)" : "white",
                            cursor: activeRole === "OWNER" ? "default" : "pointer",
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                          }}
                        >
                          {(perm?.[field] || activeRole === "OWNER") && (
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </button>
                      </td>
                    ))}
                  </tr>
                );
              })
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SECURITY LOGS TAB
// ─────────────────────────────────────────────
function SecurityLogsTab() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetch("/api/settings/security?section=logs&limit=100")
      .then(r => r.json())
      .then(d => { setLogs(d.logs || []); setTotal(d.total || 0); setLoading(false); });
  }, []);

  const fmt = (d: string) => new Date(d).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" });

  return (
    <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
      <div style={{ padding: "13px 18px", borderBottom: "1px solid var(--border)" }}>
        <span style={{ fontSize: 13.5, fontWeight: 700 }}>Security Event Log</span>
        <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 8 }}>{total} events</span>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ fontSize: 10.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", borderBottom: "1px solid var(--border-subtle)" }}>
            {["Time", "Event", "User", "IP Address", "Details"].map((h, i) => (
              <th key={i} style={{ padding: "9px 16px", textAlign: "left", fontWeight: 600 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading
            ? <tr><td colSpan={5} style={{ padding: "32px", textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>Loading…</td></tr>
            : logs.length === 0
              ? <tr><td colSpan={5} style={{ padding: "32px", textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>No security events recorded yet.</td></tr>
              : logs.map(log => (
                <tr key={log.id} style={{ borderBottom: "1px solid var(--border-subtle)", fontSize: 12.5 }}>
                  <td style={{ padding: "10px 16px", color: "var(--text-muted)", fontSize: 12, fontFamily: "monospace" }}>{fmt(log.createdAt)}</td>
                  <td style={{ padding: "10px 16px" }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 5,
                      background: `${EVENT_COLORS[log.event] ?? "#9CA3AF"}18`,
                      color: EVENT_COLORS[log.event] ?? "#9CA3AF",
                    }}>
                      {log.event.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td style={{ padding: "10px 16px", color: "var(--text-secondary)" }}>{log.userEmail ?? "—"}</td>
                  <td style={{ padding: "10px 16px", fontFamily: "monospace", fontSize: 12, color: "var(--text-muted)" }}>{log.ipAddress ?? "—"}</td>
                  <td style={{ padding: "10px 16px", fontSize: 12, color: "var(--text-muted)" }}>
                    {log.metadata ? JSON.parse(log.metadata)?.note ?? "—" : "—"}
                  </td>
                </tr>
              ))
          }
        </tbody>
      </table>
    </div>
  );
}
