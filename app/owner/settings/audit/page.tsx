"use client";

import { useState, useEffect } from "react";

const ENTITIES = ["", "Shipment", "Customer", "Expense", "Payment", "User", "Settings"];
const ACTIONS  = ["", "CREATE", "UPDATE", "DELETE"];

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ entity: "", action: "" });
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = async (p = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "50", page: String(p) });
    if (filters.entity) params.set("entity", filters.entity);
    if (filters.action) params.set("action", filters.action);
    const res = await fetch(`/api/settings/audit?${params}`);
    const d = await res.json();
    setLogs(d.logs || []);
    setTotal(d.total || 0);
    setPages(d.pages || 1);
    setLoading(false);
  };

  useEffect(() => { load(page); }, [page, filters]);

  const fmt = (d: string) => new Date(d).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" });

  const ACTION_COLOR: Record<string, string> = {
    CREATE: "#15803D",
    UPDATE: "#2563EB",
    DELETE: "#DC2626",
  };

  return (
    <div className="page-container" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <h2 style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4 }}>Audit Log</h2>
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
          Complete history of all data changes — who changed what, and when.
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <select
          value={filters.entity}
          onChange={e => { setFilters(f => ({ ...f, entity: e.target.value })); setPage(1); }}
          style={{ fontSize: 13, padding: "7px 10px", borderRadius: 7, border: "1px solid var(--border)", background: "white" }}
        >
          {ENTITIES.map(e => <option key={e} value={e}>{e || "All Entities"}</option>)}
        </select>
        <select
          value={filters.action}
          onChange={e => { setFilters(f => ({ ...f, action: e.target.value })); setPage(1); }}
          style={{ fontSize: 13, padding: "7px 10px", borderRadius: 7, border: "1px solid var(--border)", background: "white" }}
        >
          {ACTIONS.map(a => <option key={a} value={a}>{a || "All Actions"}</option>)}
        </select>
        <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 4 }}>{total} entries</span>
      </div>

      {/* Table */}
      <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ fontSize: 10.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", borderBottom: "1px solid var(--border-subtle)" }}>
              {["Time", "Action", "Entity", "Entity ID", "User", "Diff"].map((h, i) => (
                <th key={i} style={{ padding: "9px 16px", textAlign: "left", fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? <tr><td colSpan={6} style={{ padding: "32px", textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>Loading…</td></tr>
              : logs.length === 0
                ? <tr><td colSpan={6} style={{ padding: "32px", textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>No audit entries yet.</td></tr>
                : logs.map(log => (
                  <>
                    <tr key={log.id} style={{ borderBottom: "1px solid var(--border-subtle)", fontSize: 12.5, cursor: "pointer" }}
                      onClick={() => setExpanded(e => e === log.id ? null : log.id)}>
                      <td style={{ padding: "10px 16px", color: "var(--text-muted)", fontSize: 12, fontFamily: "monospace" }}>{fmt(log.createdAt)}</td>
                      <td style={{ padding: "10px 16px" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 5, background: `${ACTION_COLOR[log.action] ?? "#9CA3AF"}18`, color: ACTION_COLOR[log.action] ?? "#9CA3AF" }}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ padding: "10px 16px", fontWeight: 600 }}>{log.entity}</td>
                      <td style={{ padding: "10px 16px", fontFamily: "monospace", fontSize: 11, color: "var(--text-muted)" }}>{log.entityId.slice(0, 12)}…</td>
                      <td style={{ padding: "10px 16px", fontSize: 12, color: "var(--text-secondary)" }}>{log.userEmail ?? "system"}</td>
                      <td style={{ padding: "10px 16px" }}>
                        {(log.oldValue || log.newValue) && (
                          <button style={{ fontSize: 11, padding: "2px 8px", borderRadius: 5, border: "1px solid var(--border)", background: "white", cursor: "pointer" }}>
                            {expanded === log.id ? "Hide" : "View"}
                          </button>
                        )}
                      </td>
                    </tr>
                    {expanded === log.id && (
                      <tr key={`${log.id}-exp`}>
                        <td colSpan={6} style={{ padding: "0 16px 14px" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            {log.oldValue && (
                              <div>
                                <p style={{ fontSize: 11, fontWeight: 600, color: "#DC2626", marginBottom: 6 }}>BEFORE</p>
                                <pre style={{ fontSize: 11, background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 6, padding: "10px 12px", overflow: "auto", color: "#7F1D1D", lineHeight: 1.6 }}>
                                  {JSON.stringify(JSON.parse(log.oldValue), null, 2)}
                                </pre>
                              </div>
                            )}
                            {log.newValue && (
                              <div>
                                <p style={{ fontSize: 11, fontWeight: 600, color: "#15803D", marginBottom: 6 }}>AFTER</p>
                                <pre style={{ fontSize: 11, background: "#F0FDF4", border: "1px solid #A7F3D0", borderRadius: 6, padding: "10px 12px", overflow: "auto", color: "#14532D", lineHeight: 1.6 }}>
                                  {JSON.stringify(JSON.parse(log.newValue), null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
            }
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={pageBtn}>← Prev</button>
          <span style={{ fontSize: 12.5, color: "var(--text-muted)", padding: "6px 12px" }}>Page {page} of {pages}</span>
          <button disabled={page === pages} onClick={() => setPage(p => p + 1)} style={pageBtn}>Next →</button>
        </div>
      )}
    </div>
  );
}

const pageBtn: React.CSSProperties = {
  padding: "6px 14px", borderRadius: 7, fontSize: 12.5, fontWeight: 500,
  border: "1px solid var(--border)", background: "white", cursor: "pointer",
};
