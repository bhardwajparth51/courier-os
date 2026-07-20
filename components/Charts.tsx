"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// ─── Mini Sparkline ──────────────────────────────────────────────
interface SparklineProps {
  data: { value: number }[];
  color?: string;
}

export function Sparkline({ data, color = "#E31E24" }: SparklineProps) {
  return (
    <ResponsiveContainer width="100%" height={48}>
      <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`spark-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill={`url(#spark-${color.replace("#", "")})`}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── Revenue Area Chart with Filters ──────────────────────────────
interface RevenueChartProps {
  data7d: { day: string; revenue: number }[];
  data30d: { day: string; revenue: number }[];
  data90d: { day: string; revenue: number }[];
}

export function RevenueChart({ data7d, data30d, data90d }: RevenueChartProps) {
  const [range, setRange] = useState<"7D" | "30D" | "90D">("30D");

  const currentData =
    (range === "7D" ? data7d : range === "90D" ? data90d : data30d) || [];

  const totalRev = currentData.reduce((acc, curr) => acc + (curr?.revenue || 0), 0);
  const avgRev = Math.round(totalRev / (currentData.length || 1));

  return (
    <div>
      {/* Top Controls Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <span style={{ fontSize: 12, color: "#6B7280" }}>Average Daily Revenue: </span>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>
            ₹{avgRev.toLocaleString("en-IN")}
          </span>
        </div>

        {/* Range Selector Pills */}
        <div style={{ display: "flex", background: "#F3F4F6", padding: 3, borderRadius: 8, gap: 2 }}>
          {(["7D", "30D", "90D"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              style={{
                padding: "4px 12px",
                fontSize: 12,
                fontWeight: 600,
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                background: range === r ? "white" : "transparent",
                color: range === r ? "#E31E24" : "#6B7280",
                boxShadow: range === r ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                transition: "all 150ms ease",
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Area Chart */}
      <ResponsiveContainer width="100%" height={210}>
        <AreaChart data={currentData} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="rev-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E31E24" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#E31E24" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E5E7EB", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
            formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]}
          />
          <Area type="monotone" dataKey="revenue" stroke="#E31E24" strokeWidth={2.5} fill="url(#rev-gradient)" dot={false} activeDot={{ r: 5, fill: "#E31E24" }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Service Type Donut with Informative Legend ───────────────────
interface DonutChartProps {
  data: { name: string; value: number; color: string }[];
}

export function DonutChart({ data }: DonutChartProps) {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div style={{ display: "flex", gap: 20, alignItems: "center", height: 210 }}>
      <div style={{ flexShrink: 0, position: "relative" }}>
        <PieChart width={140} height={140}>
          <Pie data={data} cx={65} cy={65} innerRadius={42} outerRadius={64} paddingAngle={3} dataKey="value" strokeWidth={0}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
        {/* Center Total Count */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "47%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 800, color: "#111827", lineHeight: 1 }}>{total}</div>
          <div style={{ fontSize: 10, color: "#9CA3AF", textTransform: "uppercase", marginTop: 2 }}>Parcels</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, minWidth: 0 }}>
        {data.map((d) => {
          const pct = Math.round((d.value / (total || 1)) * 100);
          return (
            <div key={d.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: d.color, flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>{d.name}</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{d.value}</span>
                <span style={{ fontSize: 11, color: "#9CA3AF", marginLeft: 6 }}>({pct}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Horizontal Bar Chart (Top Destinations) ──────────────────────
interface HBarChartProps {
  data: { name: string; value: number }[];
  color?: string;
}

export function HBarChart({ data, color = "#E31E24" }: HBarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {data.map((d) => (
        <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 12.5, color: "#4B5563", fontWeight: 500, width: 85, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {d.name}
          </span>
          <div style={{ flex: 1, height: 8, background: "#F3F4F6", borderRadius: 99, overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${(d.value / max) * 100}%`,
                background: color,
                borderRadius: 99,
                transition: "width 1s cubic-bezier(.4,0,.2,1)",
              }}
            />
          </div>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: "#111827", width: 28, textAlign: "right", flexShrink: 0 }}>
            {d.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Progress Bars (Status Breakdown) ─────────────────────────────
interface StatusProgressBarProps {
  data: { name: string; value: number; color: string }[];
}

export function StatusProgressBars({ data }: StatusProgressBarProps) {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {data.map((item) => {
        const pct = Math.round((item.value / (total || 1)) * 100);
        return (
          <div key={item.name}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 12.5, fontWeight: 500, color: "#374151" }}>{item.name}</span>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: "#111827" }}>{item.value}</span>
                <span style={{ fontSize: 11, color: "#9CA3AF" }}>({pct}%)</span>
              </div>
            </div>
            <div style={{ height: 6, background: "#F3F4F6", borderRadius: 99, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${pct}%`,
                  background: item.color,
                  borderRadius: 99,
                  transition: "width 800ms ease",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
