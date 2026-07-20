"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Activity, Database, Server, RefreshCw, CheckCircle2, XCircle,
  TrendingUp, Package, Wallet, Clock, AlertTriangle,
} from "lucide-react";

interface SystemHealthData {
  status: "healthy" | "degraded" | "error";
  uptimeSeconds?: number;
  environment?: string;
  database?: {
    status: string;
    totalShipments: number;
    totalCustomers: number;
    totalPayments: number;
    totalRevenue: number;
    uncollectedCOD: number;
    totalAuditLogs: number;
  };
  metrics?: {
    memoryUsageMB: number;
    nodeVersion: string;
  };
}

export default function SystemHealthPage() {
  const [data, setData] = useState<SystemHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/health");
      const d = await res.json();
      setData(d);
      setLastRefreshed(new Date());
    } catch {
      setData(null);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const f = (n: number) => (n ?? 0).toLocaleString("en-IN");
  const fAmt = (n: number) => `₹${(n ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const fUptime = (s: number) => {
    if (!s) return "0m";
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const STATUS_COLOR: Record<string, string> = {
    healthy: "#16A34A", degraded: "#D97706", error: "#DC2626",
  };

  return (
    <div className="page-container" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4 }}>System Health</h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
            Real-time status, database stats, and operational metrics.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {lastRefreshed && (
            <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>
              Last refreshed: {lastRefreshed.toLocaleTimeString("en-IN")}
            </span>
          )}
          <button onClick={load} disabled={refreshing} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "7px 14px", borderRadius: 7, border: "1px solid var(--border)",
            background: "white", fontSize: 12.5, fontWeight: 600, cursor: "pointer",
          }}>
            <RefreshCw size={13} style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }} />
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      {loading
        ? <p style={{ fontSize: 13, color: "var(--text-muted)", padding: "20px 0" }}>Loading system health…</p>
        : !data || data.status === "error"
          ? (
            <div style={{ ...card, padding: "36px", textAlign: "center" }}>
              <AlertTriangle size={28} color="#DC2626" style={{ margin: "0 auto" }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: "#DC2626", marginTop: 10 }}>Health check failed</p>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
                {data?.error || data?.db?.error || "Could not connect to the database or server."}
              </p>
            </div>
          )
          : (
            <>
              {/* Status banner */}
              <div style={{
                ...card, padding: "16px 22px",
                display: "flex", alignItems: "center", gap: 14,
                borderLeft: `4px solid ${STATUS_COLOR[data.status] ?? "#9CA3AF"}`,
              }}>
                {data.status === "healthy"
                  ? <CheckCircle2 size={22} color="#16A34A" />
                  : <XCircle size={22} color="#DC2626" />
                }
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, textTransform: "capitalize", color: STATUS_COLOR[data.status] }}>
                    {data.status}
                  </p>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                    Database: {data.db?.ok ? `Connected — ${data.db.latencyMs}ms latency` : `Error: ${data.db?.error || "Disconnected"}`}
                  </p>
                </div>
              </div>

              {/* Metric cards row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                {[
                  { label: "Today's Shipments", value: f(data.activity?.shipmentsToday),   sub: `${f(data.activity?.shipmentsWeek)} this week`, icon: Package,    color: "#2563EB" },
                  { label: "Today's Revenue",   value: fAmt(data.activity?.revenueToday), sub: `${fAmt(data.activity?.revenueWeek)} this week`, icon: TrendingUp, color: "#16A34A" },
                  { label: "Pending COD",        value: fAmt(data.activity?.pendingCODAmount), sub: `${f(data.activity?.pendingCODCount)} shipments`, icon: Wallet,    color: "#D97706" },
                  { label: "Cash Session",       value: data.activity?.openCashSession ? "Open" : "Closed", sub: data.activity?.openCashSession ? `Since ${new Date(data.activity.openCashSession.openedAt).toLocaleTimeString("en-IN")}` : "No active session", icon: Clock, color: data.activity?.openCashSession ? "#16A34A" : "#9CA3AF" },
                ].map(({ label, value, sub, icon: Icon, color }) => (
                  <div key={label} style={{ ...card, padding: "16px 18px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <p style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", lineHeight: 1.3 }}>{label}</p>
                      <div style={{ width: 30, height: 30, borderRadius: 7, background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon size={14} color={color} />
                      </div>
                    </div>
                    <p style={{ fontSize: 20, fontWeight: 700, fontFamily: "Outfit, sans-serif", color: "var(--text-primary)", letterSpacing: "-0.02em" }}>{value}</p>
                    <p style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 4 }}>{sub}</p>
                  </div>
                ))}
              </div>

              {/* Two columns: DB stats + System info */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {/* Database Stats */}
                <div style={card}>
                  <div style={{ padding: "13px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
                    <Database size={15} color="var(--text-muted)" />
                    <span style={{ fontSize: 13.5, fontWeight: 700 }}>Database Records</span>
                  </div>
                  <div style={{ padding: "4px 0" }}>
                    {Object.entries(data.stats || {}).map(([key, count]: [string, any]) => (
                      <div key={key} style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "9px 18px", borderBottom: "1px solid var(--border-subtle)",
                      }}>
                        <span style={{ fontSize: 13, color: "var(--text-secondary)", textTransform: "capitalize" }}>
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </span>
                        <span style={{ fontSize: 13.5, fontWeight: 700, fontFamily: "monospace" }}>
                          {f(count)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* System Info */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={card}>
                    <div style={{ padding: "13px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
                      <Server size={15} color="var(--text-muted)" />
                      <span style={{ fontSize: 13.5, fontWeight: 700 }}>Server Info</span>
                    </div>
                    <div style={{ padding: "4px 0" }}>
                      {[
                        ["Node.js",     data.system?.nodeVersion || "—"],
                        ["Platform",    data.system?.platform || "—"],
                        ["Environment", data.system?.environment || "—"],
                        ["Timezone",    data.system?.timezone || "—"],
                        ["Uptime",      fUptime(data.system?.uptime)],
                      ].map(([label, value]) => (
                        <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "9px 18px", borderBottom: "1px solid var(--border-subtle)" }}>
                          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{label}</span>
                          <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "monospace" }}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Memory */}
                  <div style={{ ...card, padding: "16px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <Activity size={14} color="var(--text-muted)" />
                      <span style={{ fontSize: 13, fontWeight: 700 }}>Memory Usage</span>
                    </div>
                    <div style={{ height: 10, background: "var(--bg-muted)", borderRadius: 5, overflow: "hidden", border: "1px solid var(--border)" }}>
                      <div style={{
                        height: "100%",
                        width: `${Math.min(100, Math.round(((data.system?.memoryMB || 0) / (data.system?.memoryTotalMB || 1)) * 100))}%`,
                        background: (data.system?.memoryMB || 0) / (data.system?.memoryTotalMB || 1) > 0.8 ? "#DC2626" : "var(--brand-red)",
                        borderRadius: 5, transition: "width 0.5s ease",
                      }} />
                    </div>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>
                      {data.system?.memoryMB || 0} MB used of {data.system?.memoryTotalMB || 0} MB
                      ({Math.round(((data.system?.memoryMB || 0) / (data.system?.memoryTotalMB || 1)) * 100)}%)
                    </p>
                  </div>
                </div>
              </div>

              {/* Recent Audit Activity */}
              {data.activity?.recentAuditLogs?.length > 0 && (
                <div style={card}>
                  <div style={{ padding: "13px 18px", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ fontSize: 13.5, fontWeight: 700 }}>Recent Activity</span>
                    <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 8 }}>Last 10 changes</span>
                  </div>
                  {data.activity.recentAuditLogs.map((log: any, i: number) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 18px", borderBottom: "1px solid var(--border-subtle)", fontSize: 12.5 }}>
                      <span style={{
                        fontSize: 10.5, fontWeight: 700, padding: "2px 7px", borderRadius: 4,
                        background: log.action === "CREATE" ? "#ECFDF5" : log.action === "DELETE" ? "#FEF2F2" : "#EFF6FF",
                        color: log.action === "CREATE" ? "#15803D" : log.action === "DELETE" ? "#DC2626" : "#2563EB",
                        minWidth: 50, textAlign: "center",
                      }}>{log.action}</span>
                      <span style={{ fontWeight: 600, flex: 1 }}>{log.entity}</span>
                      <span style={{ color: "var(--text-muted)" }}>{log.userEmail ?? "system"}</span>
                      <span style={{ color: "var(--text-subtle)", fontFamily: "monospace", fontSize: 11 }}>
                        {new Date(log.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )
      }
    </div>
  );
}

const card: React.CSSProperties = {
  background: "white", border: "1px solid var(--border)",
  borderRadius: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
};
