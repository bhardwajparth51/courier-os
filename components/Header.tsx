"use client";

interface HeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
}

export function Header({ title, subtitle, badge }: HeaderProps) {
  return (
    <header className="page-header" style={{
      padding: "20px 36px",
      background: "#FFFFFF",
      borderBottom: "1px solid #E2E8F0",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <h1 style={{ fontFamily: "Outfit, sans-serif", fontSize: 20, fontWeight: 700, color: "#0F172A" }}>
            {title}
          </h1>
          {badge && <span className="badge badge-red">{badge}</span>}
        </div>
        {subtitle && (
          <p style={{ fontSize: 12.5, color: "#64748B", marginTop: 2 }}>
            {subtitle}
          </p>
        )}
      </div>
    </header>
  );
}
