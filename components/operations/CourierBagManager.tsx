"use client";

import { useState } from "react";
import { Package, Lock, Unlock, Check, Plus, Barcode, ShieldAlert, FileText, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface Bag {
  id: string;
  bagNumber: string;
  sealNumber?: string | null;
  originHub: string;
  destinationHub: string;
  status: string;
  isLocked: boolean;
  handledBy?: string | null;
  createdAt: Date | string;
  bagShipments: any[];
  manifest?: any | null;
}

interface Props {
  initialBags: Bag[];
}

export function CourierBagManager({ initialBags }: Props) {
  const [bags, setBags] = useState<Bag[]>(initialBags);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBag, setSelectedBag] = useState<Bag | null>(null);

  // Form State
  const [destinationHub, setDestinationHub] = useState("Delhi Hub");
  const [vehicleNumber, setVehicleNumber] = useState("MH-12-AB-1234");
  const [scanAwb, setScanAwb] = useState("");
  const [sealNumberInput, setSealNumberInput] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleCreateBag = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/bags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originHub: "Pune Franchise", destinationHub, vehicleNumber }),
      });
      const data = await res.json();
      if (res.ok) {
        const newBag = { ...data.bag, bagShipments: [] };
        setBags([newBag, ...bags]);
        setShowCreateModal(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleScanAwbIntoBag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBag || !scanAwb) return;
    setMessage("");
    setError("");

    try {
      const res = await fetch(`/api/bags/${selectedBag.id}/shipments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ awbNumber: scanAwb.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to scan AWB into bag");

      setMessage(`✓ AWB ${scanAwb} added to bag!`);
      setScanAwb("");

      // refresh bag count
      setBags((prev) =>
        prev.map((b) =>
          b.id === selectedBag.id ? { ...b, bagShipments: [...(b.bagShipments ?? []), data.bagShipment] } : b
        )
      );
      setSelectedBag((prev) => (prev ? { ...prev, bagShipments: [...(prev.bagShipments ?? []), data.bagShipment] } : null));
    } catch (err: any) {
      setError(err.message || "Scanning failed.");
    }
  };

  const handleSealAndLockBag = async () => {
    if (!selectedBag || !sealNumberInput) return;
    try {
      const res = await fetch(`/api/bags/${selectedBag.id}/seal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sealNumber: sealNumberInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to seal bag");

      // Update bag state
      setBags((prev) =>
        prev.map((b) => (b.id === selectedBag.id ? { ...b, status: "SEALED", isLocked: true, sealNumber: sealNumberInput, manifest: data.manifest } : b))
      );
      setSelectedBag((prev) => (prev ? { ...prev, status: "SEALED", isLocked: true, sealNumber: sealNumberInput, manifest: data.manifest } : null));
      setSealNumberInput("");
      setMessage("✓ Bag SEALED & Manifest generated successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to seal bag.");
    }
  };

  return (
    <div>
      {/* Dispatch Summary Header */}
      <div className="bento-grid" style={{ marginBottom: 20 }}>
        <div className="card" style={{ gridColumn: "span 3", padding: 18 }}>
          <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase" }}>TOTAL BAGS</span>
          <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>{bags.length}</div>
        </div>
        <div className="card" style={{ gridColumn: "span 3", padding: 18 }}>
          <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase" }}>OPEN BAGS</span>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#D97706", marginTop: 4 }}>{bags.filter((b) => b.status === "OPEN").length}</div>
        </div>
        <div className="card" style={{ gridColumn: "span 3", padding: 18 }}>
          <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase" }}>SEALED & LOCKED</span>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#16A34A", marginTop: 4 }}>{bags.filter((b) => b.isLocked).length}</div>
        </div>
        <div className="card" style={{ gridColumn: "span 3", padding: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <button type="button" onClick={() => setShowCreateModal(true)} className="btn btn-[#E31E24]" style={{ background: "var(--brand-red)", color: "white", gap: 6 }}>
            <Plus size={16} /> Create Courier Bag
          </button>
        </div>
      </div>

      {/* Grid: Bag List (6 cols) + Active Bag Workspace (6 cols) */}
      <div className="bento-grid">
        {/* Bag List */}
        <div className="card" style={{ gridColumn: "span 6", padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", fontWeight: 700 }}>
            Courier Bags Queue
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {bags.map((b) => {
              const isSelected = selectedBag?.id === b.id;
              const itemCount = b.bagShipments?.length ?? 0;
              return (
                <div
                  key={b.id}
                  onClick={() => setSelectedBag(b)}
                  style={{
                    padding: 16, borderBottom: "1px solid var(--border)", cursor: "pointer",
                    background: isSelected ? "var(--bg-subtle)" : "white", transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 800, color: "var(--brand-red)" }}>
                      {b.bagNumber}
                    </span>
                    <span className={b.isLocked ? "badge badge-green" : "badge badge-amber"}>
                      {b.isLocked ? "SEALED & LOCKED" : "OPEN"}
                    </span>
                  </div>

                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4, display: "flex", justifyContent: "space-between" }}>
                    <span>Dest: <strong>{b.destinationHub}</strong></span>
                    <span>Items: <strong>{itemCount} AWBs</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Bag Workspace */}
        <div className="card" style={{ gridColumn: "span 6", padding: 22 }}>
          {selectedBag ? (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: 14, marginBottom: 16 }}>
                <div>
                  <h2 style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 800, color: "var(--brand-red)" }}>
                    {selectedBag.bagNumber}
                  </h2>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Destination: {selectedBag.destinationHub}</span>
                </div>
                {selectedBag.isLocked ? (
                  <span className="badge badge-green" style={{ gap: 4 }}>
                    <Lock size={12} /> LOCKED ({selectedBag.sealNumber})
                  </span>
                ) : (
                  <span className="badge badge-amber" style={{ gap: 4 }}>
                    <Unlock size={12} /> OPEN
                  </span>
                )}
              </div>

              {/* Visual Progress Bar for Bag */}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, fontSize: 11, textAlign: "center" }}>
                <div style={{ color: "#16A34A", fontWeight: 700 }}>✓ Created</div>
                <div style={{ color: (selectedBag.bagShipments?.length ?? 0) > 0 ? "#16A34A" : "var(--text-muted)", fontWeight: 700 }}>
                  {(selectedBag.bagShipments?.length ?? 0) > 0 ? "✓" : "○"} Shipments
                </div>
                <div style={{ color: selectedBag.isLocked ? "#16A34A" : "var(--text-muted)", fontWeight: 700 }}>
                  {selectedBag.isLocked ? "✓ Sealed" : "○ Sealed"}
                </div>
                <div style={{ color: selectedBag.status === "DISPATCHED" ? "#16A34A" : "var(--text-muted)", fontWeight: 700 }}>
                  {selectedBag.status === "DISPATCHED" ? "✓ Dispatched" : "○ Dispatched"}
                </div>
              </div>

              {message && <div style={{ padding: 8, background: "#DCFCE7", color: "#16A34A", borderRadius: 6, fontSize: 12, marginBottom: 12 }}>{message}</div>}
              {error && <div style={{ padding: 8, background: "#FEE2E2", color: "#DC2626", borderRadius: 6, fontSize: 12, marginBottom: 12 }}>{error}</div>}

              {/* AWB Scan Form if Bag is OPEN */}
              {!selectedBag.isLocked ? (
                <form onSubmit={handleScanAwbIntoBag} style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                  <input
                    type="text"
                    className="input"
                    placeholder="Scan AWB Barcode to add into bag..."
                    value={scanAwb}
                    onChange={(e) => setScanAwb(e.target.value)}
                    style={{ fontFamily: "monospace", fontWeight: 700 }}
                  />
                  <button type="submit" className="btn btn-primary">Scan AWB</button>
                </form>
              ) : (
                <div style={{ padding: 12, background: "#F3F4F6", borderRadius: 8, fontSize: 12, color: "#4B5563", marginBottom: 20 }}>
                  🔒 Bag is Sealed with Seal Number: <strong>{selectedBag.sealNumber}</strong>. It is read-only.
                </div>
              )}

              {/* Scanned AWBs List */}
              <div style={{ marginBottom: 20 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)" }}>
                  Bag Content ({(selectedBag.bagShipments?.length ?? 0)} AWBs Scanned)
                </span>
                <div style={{ maxHeight: 160, overflowY: "auto", marginTop: 8, border: "1px solid var(--border)", borderRadius: 8, padding: 8 }}>
                  {(selectedBag.bagShipments ?? []).map((bs: any, i: number) => (
                    <div key={bs.id || i} style={{ fontSize: 12, fontFamily: "monospace", padding: "4px 0" }}>
                      • {bs.shipmentId || "AWB Scanned"}
                    </div>
                  ))}
                  {(selectedBag.bagShipments?.length ?? 0) === 0 && (
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>No AWBs scanned into this bag yet.</span>
                  )}
                </div>
              </div>

              {/* Seal & Lock Action Section */}
              {!selectedBag.isLocked && (selectedBag.bagShipments?.length ?? 0) > 0 && (
                <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
                  <label className="label">Enter Physical Seal Number to Lock Bag & Generate Manifest</label>
                  <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. SEAL892211"
                      value={sealNumberInput}
                      onChange={(e) => setSealNumberInput(e.target.value)}
                    />
                    <button type="button" onClick={handleSealAndLockBag} className="btn btn-primary" style={{ gap: 6, whitespace: "nowrap" }}>
                      <Lock size={14} /> Seal & Lock Bag
                    </button>
                  </div>
                </div>
              )}

              {selectedBag.manifest && (
                <div style={{ marginTop: 16 }}>
                  <Link href={`/owner/manifests/${selectedBag.manifest.id}`} className="btn btn-secondary btn-sm" style={{ gap: 6 }}>
                    <FileText size={14} /> View Printable Manifest
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
              Select a courier bag from the list to view contents, scan AWBs, or seal.
            </div>
          )}
        </div>
      </div>

      {/* Create Bag Modal */}
      {showCreateModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(3px)", zIndex: 90, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="card" style={{ width: 400, padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Create New Courier Bag</h3>
            <form onSubmit={handleCreateBag} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="form-group">
                <label className="label">Destination Hub *</label>
                <input type="text" className="input" value={destinationHub} onChange={(e) => setDestinationHub(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="label">Vehicle Number (Optional)</label>
                <input type="text" className="input" value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} />
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 10 }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-ghost">Cancel</button>
                <button type="submit" className="btn btn-primary">Create Bag</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
