"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, LayoutDashboard } from "lucide-react";

export default function OwnerErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Owner Portal Error]:", error);
  }, [error]);

  return (
    <div style={{ padding: "40px 20px", maxWidth: "600px", margin: "40px auto", textAlign: "center" }}>
      <div style={{ display: "inline-flex", padding: 16, borderRadius: "50%", background: "rgba(227, 30, 36, 0.1)", color: "#E31E24", marginBottom: 16 }}>
        <AlertTriangle size={36} />
      </div>
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Owner Hub Connection Issue</h2>
      <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 24 }}>
        A server or database connection error occurred while loading this section.
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <button onClick={() => reset()} className="btn btn-primary" style={{ gap: 8 }}>
          <RefreshCw size={16} /> Reload Page
        </button>
        <Link href="/owner/dashboard" className="btn btn-secondary" style={{ gap: 8 }}>
          <LayoutDashboard size={16} /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
