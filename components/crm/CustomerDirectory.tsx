"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Filter, Download, Plus, Users, UserCheck, ShieldAlert, ArrowRight, Upload, Merge, BarChart3 } from "lucide-react";
import { CustomerMergeModal } from "./CustomerMergeModal";

interface Props {
  initialCustomers: any[];
}

export function CustomerDirectory({ initialCustomers }: Props) {
  const pathname = usePathname();
  const basePath = pathname.startsWith("/employee") ? "/employee/customers" : "/owner/customers";

  const [customers, setCustomers] = useState<any[]>(initialCustomers);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [showMergeModal, setShowMergeModal] = useState(false);

  const filtered = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.companyName.toLowerCase().includes(search.toLowerCase()) ||
      c.gstNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase());

    const matchesCat = activeCategory === "ALL" || c.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  const handleExportCSV = () => {
    const headers = "Customer Code,Name,Phone,Company,GST,Category,City,Shipments\n";
    const rows = filtered
      .map((c) => `"${c.customerCode}","${c.name}","${c.phone}","${c.companyName}","${c.gstNumber}","${c.category}","${c.city}",${c.shipmentCount}`)
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `DTDC_Customers_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div>
      {/* Search & Actions Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 10, flex: 1, maxWidth: 500 }}>
          <div style={{ position: "relative", width: "100%" }}>
            <Search size={16} style={{ position: "absolute", left: 12, top: 12, color: "var(--text-muted)" }} />
            <input
              type="text"
              className="input"
              placeholder="Search by Name, Phone, GST, Company, City..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 36 }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/owner/customers/analytics" className="btn btn-secondary btn-sm" style={{ gap: 4 }}>
            <BarChart3 size={14} /> CRM Analytics
          </Link>
          <button type="button" onClick={() => setShowMergeModal(true)} className="btn btn-secondary btn-sm" style={{ gap: 4 }}>
            <Merge size={14} /> Merge Duplicates
          </button>
          <button type="button" onClick={handleExportCSV} className="btn btn-secondary btn-sm" style={{ gap: 4 }}>
            <Download size={14} /> Export CSV
          </button>
          <Link href="/owner/customers/new" className="btn btn-primary btn-sm" style={{ gap: 4 }}>
            <Plus size={14} /> Add Customer
          </Link>
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["ALL", "INDIVIDUAL", "BUSINESS"].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`btn btn-sm ${activeCategory === cat ? "btn-primary" : "btn-ghost"}`}
          >
            {cat} ACCOUNTS
          </button>
        ))}
      </div>

      {/* Customer Directory Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)", textAlign: "left", fontSize: 11.5, textTransform: "uppercase", color: "var(--text-muted)" }}>
              <th style={{ padding: "12px 16px" }}>Customer / Company</th>
              <th style={{ padding: "12px 16px" }}>Phone / GST</th>
              <th style={{ padding: "12px 16px" }}>Category</th>
              <th style={{ padding: "12px 16px", textAlign: "center" }}>Shipments</th>
              <th style={{ padding: "12px 16px", textAlign: "center" }}>Health Score</th>
              <th style={{ padding: "12px 16px", textAlign: "right" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} style={{ borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                <td style={{ padding: "12px 16px" }}>
                  <Link href={`${basePath}/${c.id}`} style={{ fontWeight: 700, color: "#111827", textDecoration: "none" }}>
                    {c.name}
                  </Link>
                  {c.companyName && c.companyName !== "-" && (
                    <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{c.companyName}</div>
                  )}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ fontFamily: "monospace", fontWeight: 700 }}>{c.phone}</div>
                  {c.gstNumber && c.gstNumber !== "-" && (
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>GST: {c.gstNumber}</div>
                  )}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span className={c.category === "BUSINESS" ? "badge badge-blue" : "badge badge-amber"}>
                    {c.category}
                  </span>
                </td>
                <td style={{ padding: "12px 16px", textAlign: "center", fontWeight: 700 }}>
                  {c.shipmentCount} AWBs
                </td>
                <td style={{ padding: "12px 16px", textAlign: "center" }}>
                  {(() => {
                    const score = c.healthScore || 85;
                    const color =
                      score >= 85 ? "#16A34A" :
                      score >= 70 ? "#2563EB" :
                      score >= 50 ? "#D97706" : "#DC2626";

                    return (
                      <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 4, width: 84 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", width: "100%", fontSize: 11, fontWeight: 700, color: "#475569" }}>
                          <span style={{ color, fontVariantNumeric: "tabular-nums" }}>{score}%</span>
                        </div>
                        <div style={{ width: "100%", height: 6, background: "#F1F5F9", borderRadius: 99, overflow: "hidden" }}>
                          <div style={{ width: `${score}%`, height: "100%", background: color, borderRadius: 99 }} />
                        </div>
                      </div>
                    );
                  })()}
                </td>
                <td style={{ padding: "12px 16px", textAlign: "right" }}>
                  <Link href={`${basePath}/${c.id}`} className="btn btn-ghost btn-sm" style={{ padding: "4px 8px" }}>
                    View Profile <ArrowRight size={12} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
            No customers found matching criteria.
          </div>
        )}
      </div>

      {showMergeModal && (
        <CustomerMergeModal
          customers={customers}
          onClose={() => setShowMergeModal(false)}
          onSuccess={() => window.location.reload()}
        />
      )}
    </div>
  );
}
