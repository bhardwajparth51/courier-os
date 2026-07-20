"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ScanBarcode, Truck, Send, CheckCircle2, CreditCard, Plus, ClipboardList } from "lucide-react";

export function EmployeeSubNav() {
  const pathname = usePathname();

  const TABS = [
    { label: "New Booking", href: "/employee/shipments/new", icon: Plus },
    { label: "Shipments Register", href: "/employee/shipments", icon: ClipboardList },
    { label: "Barcode Scanner", href: "/employee/scan", icon: ScanBarcode },
    { label: "Pickup Queue", href: "/employee/pickups", icon: Truck },
    { label: "Dispatch Hub", href: "/employee/dispatch", icon: Send },
    { label: "Delivery Board (POD)", href: "/employee/deliveries", icon: CheckCircle2 },
    { label: "Payments", href: "/employee/payments", icon: CreditCard },
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
