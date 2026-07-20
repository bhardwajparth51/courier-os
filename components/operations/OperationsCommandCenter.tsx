"use client";

import Link from "next/link";
import {
  Package, Truck, CheckCircle2, Clock, AlertTriangle, Scan,
  Plus, ArrowRight, ShieldCheck, RefreshCw, Layers, MapPin
} from "lucide-react";
import { AnimatedCounter } from "@/components/AnimatedCounter";

interface Props {
  stats: {
    pickupsToday: number;
    pendingDispatch: number;
    courierBagsCount: number;
    outForDelivery: number;
    failedDeliveries: number;
    deliveredToday: number;
    codPendingAmount: number;
  };
  recentLogs: any[];
}

export function OperationsCommandCenter({ stats, recentLogs }: Props) {
  return (
    <div>
      {/* ── 1. REAL-TIME OPERATIONS KPI GRID ── */}
      <div className="bento-grid" style={{ marginBottom: 24 }}>

        {/* Today's Pickups */}
        <div className="card card-hover" style={{ gridColumn: "span 3", padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
              Today's Pickups
            </span>
            <Clock size={18} color="#D97706" />
          </div>
          <div style={{ fontFamily: "Outfit, sans-serif", fontSize: 28, fontWeight: 800, color: "var(--text-primary)", marginTop: 8 }}>
            <AnimatedCounter value={stats.pickupsToday} />
          </div>
          <Link href="/employee/pickups" style={{ fontSize: 11.5, color: "var(--brand-red)", fontWeight: 600, marginTop: 6, display: "inline-flex", alignItems: "center", gap: 3, textDecoration: "none" }}>
            View Schedule <ArrowRight size={12} />
          </Link>
        </div>

        {/* Pending Dispatch */}
        <div className="card card-hover" style={{ gridColumn: "span 3", padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
              Pending Dispatch
            </span>
            <Package size={18} color="#2563EB" />
          </div>
          <div style={{ fontFamily: "Outfit, sans-serif", fontSize: 28, fontWeight: 800, color: "var(--text-primary)", marginTop: 8 }}>
            <AnimatedCounter value={stats.pendingDispatch} />
          </div>
          <Link href="/employee/dispatch" style={{ fontSize: 11.5, color: "var(--brand-red)", fontWeight: 600, marginTop: 6, display: "inline-flex", alignItems: "center", gap: 3, textDecoration: "none" }}>
            Open Dispatch Queue <ArrowRight size={12} />
          </Link>
        </div>

        {/* Courier Bags */}
        <div className="card card-hover" style={{ gridColumn: "span 3", padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
              Courier Bags
            </span>
            <Layers size={18} color="#7C3AED" />
          </div>
          <div style={{ fontFamily: "Outfit, sans-serif", fontSize: 28, fontWeight: 800, color: "var(--text-primary)", marginTop: 8 }}>
            <AnimatedCounter value={stats.courierBagsCount} />
          </div>
          <span style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 6, display: "block" }}>
            Active sealing & transit
          </span>
        </div>

        {/* Out for Delivery */}
        <div className="card card-hover" style={{ gridColumn: "span 3", padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
              Out For Delivery
            </span>
            <Truck size={18} color="#10B981" />
          </div>
          <div style={{ fontFamily: "Outfit, sans-serif", fontSize: 28, fontWeight: 800, color: "#10B981", marginTop: 8 }}>
            <AnimatedCounter value={stats.outForDelivery} />
          </div>
          <Link href="/employee/deliveries" style={{ fontSize: 11.5, color: "var(--brand-red)", fontWeight: 600, marginTop: 6, display: "inline-flex", alignItems: "center", gap: 3, textDecoration: "none" }}>
            Manage POD <ArrowRight size={12} />
          </Link>
        </div>

      </div>

      {/* ── 2. QUICK ACTIONS & RECENT ACTIVITY GRID ── */}
      <div className="bento-grid">

        {/* Quick Operations Bar (6 cols) */}
        <div className="card" style={{ gridColumn: "span 6", padding: 22 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Quick Operations Command</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Link href="/employee/shipments/new" className="btn btn-secondary" style={{ justifyContent: "flex-start", gap: 8, padding: 12 }}>
              <Plus size={16} color="var(--brand-red)" /> New Counter Booking
            </Link>
            <Link href="/employee/scan" className="btn btn-secondary" style={{ justifyContent: "flex-start", gap: 8, padding: 12 }}>
              <Scan size={16} color="#2563EB" /> Barcode Terminal Scanner
            </Link>
            <Link href="/employee/pickups" className="btn btn-secondary" style={{ justifyContent: "flex-start", gap: 8, padding: 12 }}>
              <Clock size={16} color="#D97706" /> Pickup Schedule
            </Link>
            <Link href="/employee/dispatch" className="btn btn-secondary" style={{ justifyContent: "flex-start", gap: 8, padding: 12 }}>
              <Layers size={16} color="#7C3AED" /> Bag Sealing & Manifests
            </Link>
          </div>
        </div>

        {/* Real-time Activity Audit Feed (6 cols) */}
        <div className="card" style={{ gridColumn: "span 6", padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Real-Time Operations Feed</h3>
            <span style={{ fontSize: 11, color: "var(--status-green)", fontWeight: 600 }}>● Live Stream</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 220, overflowY: "auto", paddingRight: 4 }}>
            {recentLogs.map((log) => (
              <div
                key={log.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 14px",
                  background: "rgba(255, 255, 255, 0.5)",
                  border: "1px solid rgba(228, 228, 231, 0.4)",
                  borderLeft: "4px solid var(--brand-red)",
                  borderRadius: 10,
                  fontSize: 12,
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.01)",
                  transition: "background 0.2s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontWeight: 800, color: "var(--text-primary)", letterSpacing: "0.02em" }}>
                    {log.action.replace(/_/g, " ")}
                  </span>
                  <span style={{ color: "var(--text-muted)", fontSize: 11 }}>by {log.performedBy}</span>
                </div>
                <span style={{ fontSize: 10.5, color: "var(--text-subtle)", fontFamily: "monospace" }}>
                  {new Date(log.performedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
