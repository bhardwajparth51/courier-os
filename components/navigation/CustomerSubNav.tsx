"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, Truck, MapPin, History, MapPin as PinIcon, Receipt, User } from "lucide-react";

export function CustomerSubNav() {
  const pathname = usePathname();

  const TABS = [
    { label: "My Dashboard", href: "/customer/dashboard", icon: Package },
    { label: "Book Shipment", href: "/customer/book", icon: Package },
    { label: "Request Pickup", href: "/customer/pickups/new", icon: Truck },
    { label: "Track Consignment", href: "/customer/track", icon: MapPin },
    { label: "Booking History", href: "/customer/history", icon: History },
    { label: "Saved Addresses", href: "/customer/addresses", icon: PinIcon },
    { label: "Invoices", href: "/customer/invoices", icon: Receipt },
    { label: "My Profile", href: "/customer/profile", icon: User },
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
