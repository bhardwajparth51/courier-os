"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Wallet, Receipt, ShieldAlert, Landmark, FileText, Percent } from "lucide-react";

export function FinanceSubNav() {
  const pathname = usePathname();

  const TABS = [
    { label: "Executive Dashboard", href: "/owner/finance", icon: BarChart3 },
    { label: "Cashbook Drawer", href: "/owner/finance/cashbook", icon: Wallet },
    { label: "Overhead Expenses", href: "/owner/finance/expenses", icon: Receipt },
    { label: "COD Reconcile", href: "/owner/finance/cod", icon: ShieldAlert },
    { label: "Bank Deposits", href: "/owner/finance/bank", icon: Landmark },
    { label: "GST Tax Ledger", href: "/owner/finance/gst", icon: Percent },
    { label: "Financial Reports", href: "/owner/finance/reports", icon: FileText },
  ];

  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 20, borderBottom: "1px solid var(--border)", paddingBottom: 12, overflowX: "auto" }}>
      {TABS.map((tab) => {
        const isActive = pathname === tab.href;
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`btn btn-sm ${isActive ? "btn-primary" : "btn-secondary"}`}
            style={{ gap: 6, whitespace: "nowrap" }}
          >
            <Icon size={14} />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
