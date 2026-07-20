"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User, Phone, Mail, MapPin, Building2, Calendar, ShieldCheck,
  Plus, Clock, Package, DollarSign, MessageSquare, FileText,
  Star, Send, ArrowRight, Printer, Share2
} from "lucide-react";
import { AddressManager } from "./AddressManager";
import { CustomerNotes } from "./CustomerNotes";
import { CommunicationTimeline } from "./CommunicationTimeline";
import { CustomerDocuments } from "./CustomerDocuments";
import { CustomerLedger } from "./CustomerLedger";

interface CustomerProfileProps {
  customer: any;
  ledgerData: any;
}

export function CustomerProfile({ customer, ledgerData }: CustomerProfileProps) {
  const pathname = usePathname();
  const baseRolePath = pathname.startsWith("/employee") ? "/employee" : pathname.startsWith("/customer") ? "/customer" : "/owner";
  const [activeTab, setActiveTab] = useState("overview");

  // Derive live activity timeline from shipments, notes, communications
  const liveActivities = [
    ...customer.shipments.map((s: any) => ({
      id: s.id,
      type: "SHIPMENT_BOOKED",
      title: `Shipment Booked: AWB #${s.awbNumber}`,
      description: `Sent to ${s.receiverName} (${s.receiverCity}) — ₹${s.totalAmount}`,
      date: s.createdAt,
      icon: <Package size={14} color="var(--brand-red)" />,
    })),
    ...customer.customerNotes.map((n: any) => ({
      id: n.id,
      type: "NOTE_ADDED",
      title: `Internal Note Added by ${n.authorName}`,
      description: n.note,
      date: n.createdAt,
      icon: <MessageSquare size={14} color="#7C3AED" />,
    })),
    ...customer.communications.map((c: any) => ({
      id: c.id,
      type: "COMMUNICATION_LOGGED",
      title: `Logged ${c.type}: ${c.subject}`,
      description: c.message,
      date: c.createdAt,
      icon: <Phone size={14} color="#2563EB" />,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalSpent = customer.shipments.reduce((acc: number, s: any) => acc + (s.totalAmount || 0), 0);
  const avgOrderValue = customer.shipments.length > 0 ? Math.round(totalSpent / customer.shipments.length) : 0;

  return (
    <div>
      {/* ── 1. CUSTOMER PROFILE HEADER CARD ── */}
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--brand-red-light)", color: "var(--brand-red)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800 }}>
              {(customer.name || "C")[0].toUpperCase()}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111827" }}>{customer.name}</h1>
                <span className={customer.category === "BUSINESS" ? "badge badge-blue" : "badge badge-amber"}>
                  {customer.category}
                </span>
                {(() => {
                  const score = customer.healthScore || 85;
                  const st =
                    score >= 85 ? { bg: "#DCFCE7", text: "#15803D", border: "#A7F3D0", dot: "#22C55E" } :
                    score >= 70 ? { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE", dot: "#3B82F6" } :
                    score >= 50 ? { bg: "#FFFBEB", text: "#B45309", border: "#FDE68A", dot: "#F59E0B" } :
                    { bg: "#FEF2F2", text: "#B91C1C", border: "#FCA5A5", dot: "#EF4444" };

                  return (
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      background: st.bg, color: st.text, border: `1px solid ${st.border}`,
                      padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 700
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: st.dot }} />
                      ★ Health Score: {score}/100
                    </span>
                  );
                })()}
              </div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4, display: "flex", gap: 16, flexWrap: "wrap" }}>
                <span>Code: <strong style={{ fontFamily: "monospace" }}>{customer.customerCode || "CUST-2026-REG"}</strong></span>
                <span>Phone: <strong>{customer.phone}</strong></span>
                {customer.companyName && <span>Company: <strong>{customer.companyName}</strong></span>}
                {customer.gstNumber && <span>GST: <strong>{customer.gstNumber}</strong></span>}
              </div>
            </div>
          </div>

          {/* Quick Actions Shortcuts Bar */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Link href={`${baseRolePath}/shipments/new`} className="btn btn-primary btn-sm" style={{ gap: 4 }}>
              <Plus size={14} /> New Shipment
            </Link>
            <Link href={`${baseRolePath}/pickups`} className="btn btn-secondary btn-sm" style={{ gap: 4 }}>
              <Calendar size={14} /> Schedule Pickup
            </Link>
            <button type="button" onClick={() => setActiveTab("ledger")} className="btn btn-secondary btn-sm" style={{ gap: 4 }}>
              <Printer size={14} /> Statement
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. SALESFORCE-LITE 8-TAB NAVIGATION ── */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
        {[
          { id: "overview", label: "Overview" },
          { id: "shipments", label: `Shipments (${customer.shipments.length})` },
          { id: "addresses", label: `Saved Addresses (${(customer.savedAddresses || []).length})` },
          { id: "ledger", label: "Tally Ledger" },
          { id: "notes", label: `Internal Notes (${customer.customerNotes.length})` },
          { id: "communications", label: `Communication Log (${customer.communications.length})` },
          { id: "documents", label: `KYC Documents (${customer.customerDocuments.length})` },
          { id: "timeline", label: "Live Activity Stream" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`btn btn-sm ${activeTab === tab.id ? "btn-primary" : "btn-secondary"}`}
            style={{ whitespace: "nowrap", fontSize: 12 }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── 3. TAB CONTENT VIEWS ── */}

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div>
          {/* Bento Overview Tiles */}
          <div className="bento-grid" style={{ marginBottom: 20 }}>
            <div className="card" style={{ gridColumn: "span 3", padding: 18 }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase" }}>LIFETIME SPENDING</span>
              <div style={{ fontSize: 24, fontWeight: 800, color: "var(--brand-red)", marginTop: 4 }}>
                ₹{totalSpent.toLocaleString("en-IN")}
              </div>
            </div>
            <div className="card" style={{ gridColumn: "span 3", padding: 18 }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase" }}>TOTAL SHIPMENTS</span>
              <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>{customer.shipments.length} AWBs</div>
            </div>
            <div className="card" style={{ gridColumn: "span 3", padding: 18 }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase" }}>AVG ORDER VALUE</span>
              <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>₹{avgOrderValue.toLocaleString("en-IN")}</div>
            </div>
            <div className="card" style={{ gridColumn: "span 3", padding: 18 }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase" }}>OUTSTANDING BALANCE</span>
              <div style={{ fontSize: 24, fontWeight: 800, color: ledgerData.outstandingBalance > 0 ? "var(--brand-red)" : "#16A34A", marginTop: 4 }}>
                ₹{ledgerData.outstandingBalance.toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          {/* Business Summary Card */}
          <div className="card" style={{ padding: 22 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Franchise Business Summary</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, fontSize: 13 }}>
              <div>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>PREFERRED EXPRESS SERVICE</span>
                <div style={{ fontWeight: 700, marginTop: 2 }}>{customer.preferredService || "EXPRESS"}</div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>PREFERRED PICKUP TIME</span>
                <div style={{ fontWeight: 700, marginTop: 2 }}>{customer.preferredPickupTime || "Morning"}</div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>PREFERRED PAYMENT MODE</span>
                <div style={{ fontWeight: 700, marginTop: 2 }}>{customer.preferredPaymentMode || "CASH"}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SHIPMENT HISTORY */}
      {activeTab === "shipments" && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)", fontSize: 11.5, textTransform: "uppercase", color: "var(--text-muted)", textAlign: "left" }}>
                <th style={{ padding: "12px 16px" }}>AWB Consignment</th>
                <th style={{ padding: "12px 16px" }}>Date</th>
                <th style={{ padding: "12px 16px" }}>Recipient & City</th>
                <th style={{ padding: "12px 16px", textAlign: "right" }}>Amount</th>
                <th style={{ padding: "12px 16px", textAlign: "center" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {customer.shipments.map((s: any) => (
                <tr key={s.id} style={{ borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                  <td style={{ padding: "12px 16px", fontFamily: "monospace", fontWeight: 800, color: "var(--brand-red)" }}>
                    <Link href={`${baseRolePath}/shipments/${s.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                      {s.awbNumber}
                    </Link>
                  </td>
                  <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 12 }}>
                    {new Date(s.createdAt).toLocaleDateString("en-IN")}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontWeight: 700 }}>{s.receiverName}</div>
                    <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{s.receiverCity}</div>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right", fontFamily: "monospace", fontWeight: 700 }}>
                    ₹{s.totalAmount}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "center" }}>
                    <span className={s.status === "DELIVERED" ? "badge badge-green" : "badge badge-blue"}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: SAVED ADDRESSES */}
      {activeTab === "addresses" && (
        <AddressManager customerId={customer.id} initialAddresses={customer.savedAddresses || []} />
      )}

      {/* TAB 4: TALLY LEDGER */}
      {activeTab === "ledger" && (
        <CustomerLedger ledgerData={ledgerData} />
      )}

      {/* TAB 5: INTERNAL NOTES */}
      {activeTab === "notes" && (
        <CustomerNotes customerId={customer.id} initialNotes={customer.customerNotes} />
      )}

      {/* TAB 6: COMMUNICATION LOG */}
      {activeTab === "communications" && (
        <CommunicationTimeline customerId={customer.id} initialComms={customer.communications} />
      )}

      {/* TAB 7: DOCUMENTS */}
      {activeTab === "documents" && (
        <CustomerDocuments customerId={customer.id} initialDocuments={customer.customerDocuments} />
      )}

      {/* TAB 8: LIVE TIMELINE STREAM */}
      {activeTab === "timeline" && (
        <div className="card" style={{ padding: 22 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Derived Authoritative Activity Timeline</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {liveActivities.map((act) => (
              <div key={act.id} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "10px 14px", background: "var(--bg-subtle)", borderRadius: 8, border: "1px solid var(--border)" }}>
                <div style={{ padding: 6, background: "white", borderRadius: "50%", border: "1px solid var(--border)" }}>{act.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{act.title}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{act.description}</div>
                </div>
                <span style={{ fontSize: 11, color: "var(--text-subtle)", fontFamily: "monospace" }}>
                  {new Date(act.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
