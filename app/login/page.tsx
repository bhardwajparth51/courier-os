"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Package, Eye, EyeOff, Loader2 } from "lucide-react";

const DEMO_ACCOUNTS = [
  {
    label: "Owner",
    email: "owner@dtdc.demo",
    password: "owner123",
  },
  {
    label: "Employee",
    email: "emp1@dtdc.demo",
    password: "emp123",
  },
  {
    label: "Customer",
    email: "cust1@dtdc.demo",
    password: "cust123",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password. Please try a demo account.");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  const fillDemo = (acc: (typeof DEMO_ACCOUNTS)[number]) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setError("");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FAFC", fontFamily: "Inter, sans-serif", padding: "32px 16px" }}>
      {/* ── CENTERED LOGIN CARD ── */}
      <div style={{ width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", padding: "40px 44px", background: "white", borderRadius: 16, border: "1px solid #E2E8F0", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
        {/* Header Branding */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <div style={{ width: 44, height: 44, background: "#E31E24", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "none" }}>
            <Package size={24} color="white" />
          </div>
          <div>
            <span style={{ fontFamily: "Outfit, sans-serif", fontSize: 24, fontWeight: 800, color: "#111827", letterSpacing: "-0.02em" }}>
              CourierOS
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#E31E24", textTransform: "uppercase", letterSpacing: "0.08em", display: "block" }}>
              DTDC Franchise ERP
            </span>
          </div>
        </div>

        {/* Title */}
        <h1 style={{ fontFamily: "Outfit, sans-serif", fontSize: 24, fontWeight: 800, color: "#111827", marginBottom: 6 }}>
          Sign in to your account
        </h1>
        <p style={{ fontSize: 13, color: "#64748B", marginBottom: 24 }}>
          Enter your franchise credentials or select a 1-click demo role below.
        </p>

        {/* Minimal 1-Click Demo Selector */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
            Quick Demo Sign-In
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4, background: "#F1F5F9", padding: 4, borderRadius: 10, border: "1px solid #E2E8F0" }}>
            {DEMO_ACCOUNTS.map((acc) => {
              const active = email === acc.email;
              return (
                <button
                  key={acc.label}
                  type="button"
                  onClick={() => fillDemo(acc)}
                  style={{
                    padding: "9px 12px",
                    background: active ? "#FFFFFF" : "transparent",
                    border: active ? "1px solid #CBD5E1" : "none",
                    borderRadius: 7,
                    cursor: "pointer",
                    fontSize: 12.5,
                    fontWeight: active ? 700 : 500,
                    color: active ? "#0F172A" : "#64748B",
                    boxShadow: active ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                    transition: "all 0.15s ease",
                    textAlign: "center",
                  }}
                >
                  {acc.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {error && (
            <div style={{ background: "#FEE2E2", border: "1px solid #FCA5A5", borderRadius: 10, padding: 12, fontSize: 13, color: "#DC2626", fontWeight: 500 }}>
              ⚠️ {error}
            </div>
          )}

          <div className="form-group">
            <label className="label" htmlFor="email" style={{ fontSize: 12.5, fontWeight: 700, color: "#334155" }}>
              Email address
            </label>
            <input
              id="email"
              type="email"
              className="input"
              placeholder="e.g. owner@dtdc.demo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ height: 44, fontSize: 14 }}
            />
          </div>

          <div className="form-group">
            <label className="label" htmlFor="password" style={{ fontSize: 12.5, fontWeight: 700, color: "#334155" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="password"
                type={showPass ? "text" : "password"}
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ height: 44, fontSize: 14, paddingRight: 40 }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#94A3B8",
                }}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              height: 46,
              fontSize: 15,
              fontWeight: 800,
              background: "#E31E24",
              borderRadius: 10,
              marginTop: 6,
              boxShadow: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Authenticating...
              </>
            ) : (
              "Sign In to CourierOS"
            )}
          </button>
        </form>

        <div style={{ marginTop: 28, paddingTop: 18, borderTop: "1px solid #F1F5F9", textAlign: "center", fontSize: 11.5, color: "#94A3B8" }}>
          DTDC Express Limited · Franchise Management ERP System v3.0
        </div>
      </div>
    </div>
  );
}
