"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserCog, Archive, BarChart3, Lightbulb, FileText, Settings } from "lucide-react";

export function ManagementSubNav() {
  const pathname = usePathname();

  const TABS = [
    { label: "Staff Directory", href: "/owner/employees", icon: UserCog },
    { label: "Station Inventory", href: "/owner/inventory", icon: Archive },
    { label: "Franchise Analytics", href: "/owner/analytics", icon: BarChart3 },
    { label: "AI Insights", href: "/owner/insights", icon: Lightbulb },
    { label: "Financial Reports", href: "/owner/reports", icon: FileText },
    { label: "Settings", href: "/owner/settings", icon: Settings },
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
