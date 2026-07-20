"use client";

import { useState } from "react";
import { Clock, MapPin, Phone, UserCheck, CheckCircle, AlertCircle, Plus } from "lucide-react";

interface Pickup {
  id: string;
  pickupNumber: string;
  senderName: string;
  senderPhone: string;
  address: string;
  city: string;
  pincode: string;
  scheduledDate: string | Date;
  preferredTime: string;
  status: string;
  assignedEmployeeId?: string | null;
  remarks?: string | null;
}

interface Props {
  initialPickups: Pickup[];
  employees?: { id: string; name: string }[];
}

export function PickupCalendar({ initialPickups, employees = [] }: Props) {
  const [pickups, setPickups] = useState<Pickup[]>(initialPickups);
  const [activeTab, setActiveTab] = useState<"TODAY" | "ASSIGNED" | "PENDING" | "COMPLETED">("TODAY");
  const [selectedPickup, setSelectedPickup] = useState<Pickup | null>(null);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [selectedEmp, setSelectedEmp] = useState("");

  const filtered = pickups.filter((p) => {
    if (activeTab === "TODAY") return true;
    if (activeTab === "ASSIGNED") return p.status === "ASSIGNED";
    if (activeTab === "PENDING") return p.status === "PENDING";
    if (activeTab === "COMPLETED") return p.status === "COMPLETED";
    return true;
  });

  const handleAssign = async (pickupId: string) => {
    if (!selectedEmp) return;
    try {
      const res = await fetch(`/api/pickups/${pickupId}/assign`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: selectedEmp }),
      });
      if (res.ok) {
        setPickups((prev) =>
          prev.map((p) => (p.id === pickupId ? { ...p, status: "ASSIGNED", assignedEmployeeId: selectedEmp } : p))
        );
        setAssigningId(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleComplete = async (pickupId: string) => {
    try {
      const res = await fetch(`/api/pickups/${pickupId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });
      if (res.ok) {
        setPickups((prev) =>
          prev.map((p) => (p.id === pickupId ? { ...p, status: "COMPLETED" } : p))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
        {[
          { key: "TODAY", label: "Today's Schedule" },
          { key: "PENDING", label: "Pending Assignment" },
          { key: "ASSIGNED", label: "Assigned" },
          { key: "COMPLETED", label: "Completed" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as any)}
            className={`btn ${activeTab === tab.key ? "btn-primary" : "btn-ghost"}`}
            style={{ fontSize: 13, padding: "6px 14px" }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid of Pickup Cards */}
      <div className="bento-grid">
        {filtered.map((p) => {
          const isPending = p.status === "PENDING";
          const isAssigned = p.status === "ASSIGNED";
          const isCompleted = p.status === "COMPLETED";

          return (
            <div key={p.id} className="card card-hover" style={{ gridColumn: "span 6", padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 800, color: "var(--brand-red)" }}>
                    {p.pickupNumber}
                  </span>
                  <div style={{ fontSize: 15, fontWeight: 700, marginTop: 2 }}>{p.senderName}</div>
                </div>
                <span className={isCompleted ? "badge badge-green" : isAssigned ? "badge badge-blue" : "badge badge-amber"}>
                  {p.status}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12.5, color: "var(--text-muted)", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Phone size={13} /> {p.senderPhone}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <MapPin size={13} /> {p.address}, {p.city} ({p.pincode})
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Clock size={13} /> {p.preferredTime}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                {assigningId === p.id ? (
                  <div style={{ display: "flex", gap: 6, width: "100%" }}>
                    <select className="select select-sm" style={{ flex: 1 }} value={selectedEmp} onChange={(e) => setSelectedEmp(e.target.value)}>
                      <option value="">Select Staff...</option>
                      {employees.map((e) => (
                        <option key={e.id} value={e.id}>{e.name}</option>
                      ))}
                    </select>
                    <button type="button" onClick={() => handleAssign(p.id)} className="btn btn-primary btn-sm">Save</button>
                    <button type="button" onClick={() => setAssigningId(null)} className="btn btn-ghost btn-sm">X</button>
                  </div>
                ) : (
                  <>
                    <div>
                      {isAssigned && <span style={{ fontSize: 11, color: "var(--status-blue)", fontWeight: 600 }}>Assigned to Staff</span>}
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {isPending && (
                        <button type="button" onClick={() => setAssigningId(p.id)} className="btn btn-secondary btn-sm" style={{ gap: 4 }}>
                          <UserCheck size={13} /> Assign Staff
                        </button>
                      )}
                      {!isCompleted && (
                        <button type="button" onClick={() => handleComplete(p.id)} className="btn btn-primary btn-sm" style={{ gap: 4 }}>
                          <CheckCircle size={13} /> Mark Completed
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="card" style={{ gridColumn: "span 12", textAlign: "center", padding: 36, color: "var(--text-muted)" }}>
            No pickup requests matching current tab.
          </div>
        )}
      </div>
    </div>
  );
}
