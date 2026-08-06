"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[CourierOS ErrorBoundary Captured]:", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0A0D14",
        color: "#F3F4F6",
        fontFamily: "Inter, -apple-system, sans-serif",
        padding: "24px",
      }}
    >
      <div
        style={{
          maxWidth: "480px",
          width: "100%",
          backgroundColor: "#111827",
          border: "1px solid #1F2937",
          borderRadius: "16px",
          padding: "36px 28px",
          textAlign: "center",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            backgroundColor: "rgba(227, 30, 36, 0.15)",
            color: "#E31E24",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px auto",
          }}
        >
          <AlertTriangle size={32} />
        </div>

        <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}>
          Temporary System Unavailable
        </h2>
        <p style={{ fontSize: "14px", color: "#9CA3AF", lineHeight: "1.5", marginBottom: "24px" }}>
          We encountered a database connection disruption. You can reload the page or navigate back to the operational dashboard.
        </p>

        {error?.digest && (
          <div
            style={{
              backgroundColor: "#1F2937",
              padding: "8px 12px",
              borderRadius: "6px",
              fontSize: "12px",
              color: "#6B7280",
              fontFamily: "monospace",
              marginBottom: "24px",
            }}
          >
            Error Ref: {error.digest}
          </div>
        )}

        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => reset()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#E31E24",
              color: "#FFFFFF",
              fontWeight: 600,
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
              transition: "background-color 0.2s",
            }}
          >
            <RefreshCw size={16} />
            Try Again
          </button>

          <Link
            href="/owner/dashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#374151",
              color: "#F3F4F6",
              fontWeight: 600,
              padding: "10px 20px",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "14px",
            }}
          >
            <Home size={16} />
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
