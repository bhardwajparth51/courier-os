"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search, Download, MoreVertical, Eye, Printer,
  FileText, RefreshCw, ChevronLeft, ChevronRight
} from "lucide-react";
import { ShippingLabel } from "@/components/shipments/ShippingLabel";
import { GSTInvoice } from "@/components/shipments/GSTInvoice";
import { StatusUpdateModal } from "@/components/shipments/StatusUpdateModal";

interface Shipment {
  id: string;
  awbNumber: string;
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  senderCity: string;
  senderState: string;
  senderPincode: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  receiverCity: string;
  receiverState: string;
  receiverPincode: string;
  status: string;
  serviceType: string;
  parcelType: string;
  weight: number;
  freightCharge: number;
  fuelSurcharge: number;
  insuranceCharge: number;
  codAmount: number;
  totalAmount: number;
  paymentMethod: string;
  expectedDelivery: Date | string | null;
  createdAt: Date | string;
  payment?: { status: string; method: string } | null;
  branch?: { name: string; city: string; phone: string; settings?: any } | null;
}

const STATUS_BADGE: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  BOOKED:           { label: "Booked",          bg: "#EFF6FF", color: "#1D4ED8", dot: "#3B82F6" },
  AWAITING_PICKUP:  { label: "Awaiting Pickup", bg: "#FFFBEB", color: "#B45309", dot: "#F59E0B" },
  COLLECTED:        { label: "Collected",       bg: "#EFF6FF", color: "#1D4ED8", dot: "#3B82F6" },
  ORIGIN_HUB:       { label: "At Origin Hub",   bg: "#F5F3FF", color: "#6D28D9", dot: "#8B5CF6" },
  REGIONAL_HUB:     { label: "Regional Hub",    bg: "#F5F3FF", color: "#6D28D9", dot: "#8B5CF6" },
  SORTING_CENTER:   { label: "Sorting Center",  bg: "#FFFBEB", color: "#B45309", dot: "#F59E0B" },
  DESTINATION_HUB:  { label: "Dest. Hub",       bg: "#FFFBEB", color: "#B45309", dot: "#F59E0B" },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", bg: "#EFF6FF", color: "#1D4ED8", dot: "#3B82F6" },
  DELIVERED:        { label: "Delivered",       bg: "#DCFCE7", color: "#15803D", dot: "#22C55E" },
  CANCELLED:        { label: "Cancelled",       bg: "#FEF2F2", color: "#B91C1C", dot: "#EF4444" },
  RTO:              { label: "Returned",        bg: "#FEF2F2", color: "#B91C1C", dot: "#EF4444" },
};

interface ShipmentTableProps {
  initialShipments: Shipment[];
  role?: "OWNER" | "EMPLOYEE" | "CUSTOMER";
}

export function ShipmentTable({ initialShipments, role = "EMPLOYEE" }: ShipmentTableProps) {
  const [shipments, setShipments] = useState<Shipment[]>(initialShipments);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [serviceFilter, setServiceFilter] = useState("ALL");
  const [exportScope, setExportScope] = useState<"FILTERED" | "TODAY" | "ALL">("FILTERED");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Selected shipment for modals
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [selectedLabelShipment, setSelectedLabelShipment] = useState<Shipment | null>(null);
  const [selectedInvoiceShipment, setSelectedInvoiceShipment] = useState<Shipment | null>(null);
  const [selectedStatusShipment, setSelectedStatusShipment] = useState<Shipment | null>(null);

  // Multi-field search & filtering
  const filtered = useMemo(() => {
    return shipments.filter((s) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !search ||
        s.awbNumber.toLowerCase().includes(q) ||
        s.senderName.toLowerCase().includes(q) ||
        s.senderPhone.includes(q) ||
        s.receiverName.toLowerCase().includes(q) ||
        s.receiverPhone.includes(q) ||
        s.receiverCity.toLowerCase().includes(q);

      const matchesStatus = statusFilter === "ALL" || s.status === statusFilter;
      const matchesService = serviceFilter === "ALL" || s.serviceType === serviceFilter;

      return matchesSearch && matchesStatus && matchesService;
    });
  }, [shipments, search, statusFilter, serviceFilter]);

  // Paginated View
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  // Relative Shipment Age Helper
  const [nowMs] = useState(() => Date.now());

  const getShipmentAge = (createdAt: Date | string) => {
    const diffMs = nowMs - new Date(createdAt).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  // CSV Export Handler
  const handleExportCSV = () => {
    let target = filtered;
    if (exportScope === "TODAY") {
      const todayStr = new Date().toISOString().slice(0, 10);
      target = shipments.filter((s) => new Date(s.createdAt).toISOString().slice(0, 10) === todayStr);
    } else if (exportScope === "ALL") {
      target = shipments;
    }

    const headers = ["AWB Number,Sender,Sender Phone,Receiver,Receiver Phone,Destination,Service,Status,Payment Status,Amount,Date\n"];
    const rows = target.map(
      (s) => `${s.awbNumber},"${s.senderName}",${s.senderPhone},"${s.receiverName}",${s.receiverPhone},"${s.receiverCity}",${s.serviceType},${s.status},${s.payment?.status ?? "COLLECTED"},${s.totalAmount},"${new Date(s.createdAt).toLocaleDateString("en-IN")}"`
    );

    const blob = new Blob([headers.concat(rows.join("\n")).join("")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shipments_export_${exportScope.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div>
      {/* ── TOP CONTROLS & FILTER BAR ── */}
      <div className="card" style={{ padding: "16px 20px", marginBottom: 18, background: "white", border: "1px solid #E2E8F0", borderRadius: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>

          {/* Search Box */}
          <div style={{ position: "relative", width: 280 }}>
            <Search size={14} color="#94A3B8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              className="input"
              placeholder="Search AWB, Phone, Name, City..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              style={{ paddingLeft: 34, height: 38, background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 13 }}
            />
          </div>

          {/* Filters */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <select
              className="select"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              style={{ height: 38, border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 13, background: "#F8FAFC" }}
            >
              <option value="ALL">All Statuses</option>
              <option value="BOOKED">Booked</option>
              <option value="AWAITING_PICKUP">Awaiting Pickup</option>
              <option value="COLLECTED">Collected</option>
              <option value="ORIGIN_HUB">Origin Hub</option>
              <option value="SORTING_CENTER">Sorting Center</option>
              <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
              <option value="DELIVERED">Delivered</option>
              <option value="RTO">RTO / Returned</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <select
              className="select"
              value={serviceFilter}
              onChange={(e) => { setServiceFilter(e.target.value); setCurrentPage(1); }}
              style={{ height: 38, border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 13, background: "#F8FAFC" }}
            >
              <option value="ALL">All Services</option>
              <option value="EXPRESS">Express Air</option>
              <option value="STANDARD">Standard</option>
              <option value="SURFACE">Surface Cargo</option>
              <option value="INTERNATIONAL">International</option>
            </select>

            {/* CSV Export Scope */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <select
                className="select"
                value={exportScope}
                onChange={(e) => setExportScope(e.target.value as any)}
                style={{ height: 38, fontSize: 12.5, border: "1px solid #E2E8F0", borderRadius: 8, background: "#F8FAFC" }}
              >
                <option value="FILTERED">Export Filtered</option>
                <option value="TODAY">Export Today&apos;s</option>
                <option value="ALL">Export All DB</option>
              </select>
              <button type="button" onClick={handleExportCSV} className="btn btn-secondary btn-sm" style={{ height: 38, gap: 6, borderRadius: 8, border: "1px solid #E2E8F0" }}>
                <Download size={13} /> Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── TABLE CONTAINER ── */}
      <div className="card" style={{ padding: 0, overflow: "hidden", background: "white", border: "1px solid #E2E8F0", borderRadius: 14 }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                <th style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>AWB Number</th>
                <th style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>Sender</th>
                <th style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>Receiver</th>
                <th style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>Destination</th>
                <th style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>Service</th>
                <th style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
                <th style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>Age</th>
                <th style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>Payment</th>
                <th style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>Amount</th>
                <th style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((s) => {
                const st = STATUS_BADGE[s.status] ?? { label: s.status, bg: "#F1F5F9", color: "#475569", dot: "#94A3B8" };
                const payStatus = s.payment?.status ?? "COLLECTED";

                return (
                  <tr key={s.id} style={{ borderBottom: "1px solid #F8FAFC" }}>
                    <td>
                      <Link href={`/${role.toLowerCase()}/shipments/${s.id}`} style={{ textDecoration: "none" }}>
                        <span style={{ fontFamily: "monospace", fontSize: 12.5, fontWeight: 700, color: "#EA580C" }}>
                          {s.awbNumber}
                        </span>
                      </Link>
                    </td>
                    <td style={{ fontWeight: 600, color: "#0F172A" }}>{s.senderName}</td>
                    <td style={{ color: "#334155" }}>{s.receiverName}</td>
                    <td style={{ color: "#64748B", fontSize: 12.5 }}>{s.receiverCity}</td>
                    <td>
                      <span style={{ background: "#F1F5F9", color: "#475569", padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                        {s.serviceType}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        background: st.bg, color: st.color,
                        padding: "4px 10px", borderRadius: 99, fontSize: 11.5, fontWeight: 600
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: st.dot }} />
                        {st.label}
                      </span>
                    </td>
                    <td style={{ fontSize: 11.5, color: "#94A3B8", fontFamily: "monospace" }}>
                      {getShipmentAge(s.createdAt)}
                    </td>
                    <td>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        background: payStatus === "PENDING" ? "#FFFBEB" : "#DCFCE7",
                        color: payStatus === "PENDING" ? "#B45309" : "#15803D",
                        padding: "3px 8px", borderRadius: 99, fontSize: 11, fontWeight: 600
                      }}>
                        {payStatus}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, fontSize: 13, color: "#0F172A", fontVariantNumeric: "tabular-nums" }}>
                      ₹{s.totalAmount.toLocaleString("en-IN")}
                    </td>
                    <td style={{ textAlign: "center", position: "relative" }}>
                      <button
                        type="button"
                        onClick={() => setActiveMenuId(activeMenuId === s.id ? null : s.id)}
                        className="btn btn-ghost btn-sm"
                        style={{ padding: 4 }}
                      >
                        <MoreVertical size={16} />
                      </button>

                      {/* Dropdown Action Menu */}
                      {activeMenuId === s.id && (
                        <div
                          style={{
                            position: "absolute", right: 16, top: 38, width: 160, background: "white",
                            border: "1px solid var(--border)", borderRadius: 8, boxShadow: "var(--shadow-hover)",
                            zIndex: 60, display: "flex", flexDirection: "column", padding: 4, textAlign: "left",
                          }}
                        >
                          <Link
                            href={`/${role.toLowerCase()}/shipments/${s.id}`}
                            className="nav-item"
                            style={{ padding: "6px 10px", fontSize: 12 }}
                            onClick={() => setActiveMenuId(null)}
                          >
                            <Eye size={13} /> View Details
                          </Link>
                          <button
                            type="button"
                            className="nav-item"
                            style={{ padding: "6px 10px", fontSize: 12, border: "none", background: "none" }}
                            onClick={() => { setSelectedStatusShipment(s); setActiveMenuId(null); }}
                          >
                            <RefreshCw size={13} /> Update Status
                          </button>
                          <button
                            type="button"
                            className="nav-item"
                            style={{ padding: "6px 10px", fontSize: 12, border: "none", background: "none" }}
                            onClick={() => { setSelectedLabelShipment(s); setActiveMenuId(null); }}
                          >
                            <Printer size={13} /> Thermal Label
                          </button>
                          <button
                            type="button"
                            className="nav-item"
                            style={{ padding: "6px 10px", fontSize: 12, border: "none", background: "none" }}
                            onClick={() => { setSelectedInvoiceShipment(s); setActiveMenuId(null); }}
                          >
                            <FileText size={13} /> GST Invoice
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}

              {paginated.length === 0 && (
                <tr>
                  <td colSpan={10} style={{ textAlign: "center", padding: 36, color: "var(--text-muted)" }}>
                    No matching shipments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderTop: "1px solid var(--border)", background: "var(--bg-subtle)" }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Showing {filtered.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} shipments
          </span>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="btn btn-secondary btn-sm"
              style={{ gap: 4 }}
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <span style={{ fontSize: 12, fontWeight: 700, padding: "0 8px" }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="btn btn-secondary btn-sm"
              style={{ gap: 4 }}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedLabelShipment && (
        <ShippingLabel shipment={selectedLabelShipment} onClose={() => setSelectedLabelShipment(null)} />
      )}
      {selectedInvoiceShipment && (
        <GSTInvoice shipment={selectedInvoiceShipment} onClose={() => setSelectedInvoiceShipment(null)} />
      )}
      {selectedStatusShipment && (
        <StatusUpdateModal
          shipmentId={selectedStatusShipment.id}
          awbNumber={selectedStatusShipment.awbNumber}
          currentStatus={selectedStatusShipment.status as any}
          onClose={() => setSelectedStatusShipment(null)}
          onSuccess={() => {
            // refresh data
            fetch(`/api/shipments?limit=100`)
              .then((res) => res.json())
              .then((d) => d.shipments && setShipments(d.shipments));
          }}
        />
      )}
    </div>
  );
}
