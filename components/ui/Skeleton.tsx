import React from "react";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({
  width = "100%",
  height = "20px",
  borderRadius = 8,
  className = "",
  style = {},
}: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div style={{ paddingTop: 8, paddingBottom: 40, fontFamily: "'Inter', sans-serif" }}>
      {/* Header Skeleton */}
      <div style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <Skeleton width={320} height={28} style={{ marginBottom: 8 }} />
          <Skeleton width={200} height={16} />
        </div>
        <Skeleton width={160} height={40} borderRadius={10} />
      </div>

      {/* 4 Top KPI Cards Skeleton */}
      <div className="bento-grid" style={{ marginBottom: 24 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card" style={{ gridColumn: "span 3", padding: "20px 24px", background: "white", border: "1px solid #E2E8F0", borderRadius: 12 }}>
            <Skeleton width={110} height={12} style={{ marginBottom: 16 }} />
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <Skeleton width={80} height={36} />
              <Skeleton width={60} height={20} borderRadius={99} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Chart & Traffic Skeleton */}
      <div className="bento-grid" style={{ marginBottom: 24 }}>
        <div className="card" style={{ gridColumn: "span 8", padding: "24px", background: "white", border: "1px solid #E2E8F0", borderRadius: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
            <Skeleton width={180} height={22} />
            <Skeleton width={240} height={32} borderRadius={8} />
          </div>
          <Skeleton width="100%" height={180} borderRadius={12} />
        </div>
        <div className="card" style={{ gridColumn: "span 4", padding: "24px", background: "white", border: "1px solid #E2E8F0", borderRadius: 14 }}>
          <Skeleton width={140} height={20} style={{ marginBottom: 20 }} />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <Skeleton width={90} height={14} />
                <Skeleton width={45} height={14} />
              </div>
              <Skeleton width="100%" height={8} borderRadius={99} />
            </div>
          ))}
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="card" style={{ padding: "24px", background: "white", border: "1px solid #E2E8F0", borderRadius: 14 }}>
        <Skeleton width={160} height={20} style={{ marginBottom: 20 }} />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #F8FAFC" }}>
            <Skeleton width={100} height={24} borderRadius={99} />
            <Skeleton width={140} height={16} />
            <Skeleton width={80} height={16} />
            <Skeleton width={90} height={16} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="card" style={{ padding: "16px 20px", background: "white", border: "1px solid #E2E8F0", borderRadius: 12, display: "flex", justifyContent: "space-between" }}>
        <Skeleton width={260} height={38} borderRadius={8} />
        <div style={{ display: "flex", gap: 10 }}>
          <Skeleton width={120} height={38} borderRadius={8} />
          <Skeleton width={120} height={38} borderRadius={8} />
        </div>
      </div>
      <div className="card" style={{ padding: 0, overflow: "hidden", background: "white", border: "1px solid #E2E8F0", borderRadius: 14 }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #E2E8F0", background: "#F8FAFC" }}>
          <Skeleton width="100%" height={20} />
        </div>
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} style={{ padding: "16px 20px", borderBottom: "1px solid #F8FAFC", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Skeleton width={110} height={16} />
            <Skeleton width={130} height={16} />
            <Skeleton width={100} height={16} />
            <Skeleton width={90} height={24} borderRadius={99} />
            <Skeleton width={70} height={16} />
          </div>
        ))}
      </div>
    </div>
  );
}
