"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PackageSearch, Plus, Truck, Send, CheckCircle2 } from "lucide-react";

export function LogisticsSubNav() {
  const pathname = usePathname();

  const TABS = [
    { label: "Consignments Register", href: "/owner/shipments", icon: PackageSearch },
    { label: "Create Booking", href: "/owner/shipments/new", icon: Plus },
    { label: "Pickup Requests", href: "/owner/pickups", icon: Truck },
    { label: "Dispatch & Bags", href: "/owner/dispatch", icon: Send },
    { label: "Delivery Runs & POD", href: "/owner/deliveries", icon: CheckCircle2 },
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
