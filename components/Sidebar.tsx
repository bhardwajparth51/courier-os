"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import NotificationBell from "@/components/NotificationBell";
import {
  Package,
  LayoutDashboard,
  PackageSearch,
  ClipboardList,
  Users,
  Truck,
  BarChart3,
  FileText,
  Archive,
  Settings,
  LogOut,
  ScanBarcode,
  CreditCard,
  MapPin,
  History,
  Receipt,
  BookOpen,
  UserCog,
  Landmark,
  TrendingUp,
  Lightbulb,
  Send,
  CheckCircle2,
  Wallet,
  Menu,
  X,
  ArrowDownUp,
  Activity,
} from "lucide-react";


type Role = "OWNER" | "EMPLOYEE" | "CUSTOMER";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface NavSection {
  section?: string;
  items: NavItem[];
}

const NAV_CONFIG: Record<Role, NavSection[]> = {
  OWNER: [
    {
      section: "Overview & Operations",
      items: [
        { label: "Dashboard", href: "/owner/dashboard", icon: LayoutDashboard },
        { label: "Shipments & Logistics", href: "/owner/shipments", icon: PackageSearch },
        { label: "Scan & Dispatch", href: "/owner/scan", icon: ScanBarcode },
        { label: "Customers & CRM", href: "/owner/customers", icon: Users },
      ],
    },
    {
      section: "Finance & Admin",
      items: [
        { label: "Finance & Accounts", href: "/owner/finance", icon: Landmark },
        { label: "Master Data", href: "/owner/master-data", icon: Archive },
        { label: "Rate Card", href: "/owner/rates", icon: CreditCard },
        { label: "Staff & Operations",  href: "/owner/employees",    icon: UserCog },
        { label: "Import & Export",      href: "/owner/import-export", icon: ArrowDownUp },
        { label: "System Health",         href: "/owner/system-health", icon: Activity },
        { label: "Settings",              href: "/owner/settings",      icon: Settings },
      ],
    },
  ],

  EMPLOYEE: [
    {
      section: "Daily Counter",
      items: [
        { label: "Dashboard", href: "/employee/dashboard", icon: LayoutDashboard },
        { label: "Create Booking", href: "/employee/shipments/new", icon: BookOpen },
        { label: "All Consignments", href: "/employee/shipments", icon: ClipboardList },
        { label: "Scan & Dispatch", href: "/employee/scan", icon: ScanBarcode },
      ],
    },
    {
      section: "Finance & Directory",
      items: [
        { label: "Cashbook & Drawer", href: "/employee/cashbook", icon: Wallet },
        { label: "Expense Claims", href: "/employee/expenses", icon: Receipt },
        { label: "Customers Directory", href: "/employee/customers", icon: Users },
      ],
    },
  ],

  CUSTOMER: [
    {
      section: "Logistics",
      items: [
        { label: "Dashboard", href: "/customer/dashboard", icon: LayoutDashboard },
        { label: "Book Shipment", href: "/customer/book", icon: Package },
        { label: "Track Consignment", href: "/customer/track", icon: MapPin },
      ],
    },
    {
      section: "Account & Billing",
      items: [
        { label: "Saved Addresses", href: "/customer/addresses", icon: MapPin },
        { label: "Invoices", href: "/customer/invoices", icon: Receipt },
      ],
    },
  ],
};

interface SidebarProps {
  role: Role;
  userName?: string | null;
  userEmail?: string | null;
}

export default function Sidebar({ role, userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const roleLabel: Record<Role, string> = {
    OWNER: "Franchise Owner",
    EMPLOYEE: "Staff",
    CUSTOMER: "Customer",
  };

  const roleColor: Record<Role, string> = {
    OWNER: "#E31E24",
    EMPLOYEE: "#2563EB",
    CUSTOMER: "#16A34A",
  };

  const roleColorBg: Record<Role, string> = {
    OWNER: "#FFEBEE",
    EMPLOYEE: "#DBEAFE",
    CUSTOMER: "#DCFCE7",
  };

  const sections = NAV_CONFIG[role];

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="mobile-header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 30,
              height: 30,
              background: "#E31E24",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Package size={16} color="white" />
          </div>
          <span style={{ fontFamily: "Outfit, sans-serif", fontSize: 16, fontWeight: 700, color: "#111827" }}>
            CourierOS
          </span>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="btn btn-ghost btn-sm"
          style={{ padding: 6 }}
          aria-label="Toggle Navigation Menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Drawer / Fixed Panel */}
      <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>
        {/* Logo */}
        <div
          style={{
            padding: "18px 16px 14px",
            borderBottom: "1px solid #E5E7EB",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                background: "#EA580C",
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Package size={17} color="white" />
            </div>
            <div>
              <div
                style={{
                  fontFamily: "Outfit, sans-serif",
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#111827",
                  lineHeight: 1.2,
                }}
              >
                CourierOS
              </div>
              <div style={{ fontSize: 10.5, color: "#9CA3AF", lineHeight: 1.2 }}>
                DTDC Franchise
              </div>
            </div>
          </div>
          {/* Close button inside sidebar on mobile */}
          <button
            type="button"
            className="mobile-close-btn"
            onClick={() => setMobileOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav Links */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "10px 10px" }}>
          {sections.map((group, gi) => (
            <div key={gi} style={{ marginBottom: 4 }}>
              {group.section && (
                <div className="nav-section-label">{group.section}</div>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== `/${role.toLowerCase()}/dashboard` &&
                    pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-item${isActive ? " active" : ""}`}
                  >
                    <Icon size={16} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User info & Sign out */}
        <div
          style={{
            borderTop: "1px solid #E5E7EB",
            padding: "12px 12px",
          }}
        >
          {/* Role badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "3px 8px",
              background: roleColorBg[role],
              borderRadius: 99,
              marginBottom: 10,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: roleColor[role],
              }}
            />
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: roleColor[role],
              }}
            >
              {roleLabel[role]}
            </span>
          </div>

          {/* User Profile Info */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              marginBottom: 10,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                background: "#F3F4F6",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 600,
                color: "#374151",
                flexShrink: 0,
              }}
            >
              {userName?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#111827",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {userName ?? "User"}
              </div>
              <div
                style={{
                  fontSize: 11.5,
                  color: "#9CA3AF",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {userEmail}
              </div>
            </div>
            <NotificationBell />
          </div>


          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="btn btn-ghost btn-sm"
            style={{ width: "100%", justifyContent: "flex-start", gap: 8, color: "#6B7280" }}
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
