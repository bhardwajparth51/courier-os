"use client";

import { useState } from "react";
import { MapPin, Plus, Check, Trash2, Home, Building2, Warehouse, Factory } from "lucide-react";

interface Props {
  customerId: string;
  initialAddresses: any[];
}

export function AddressManager({ customerId, initialAddresses }: Props) {
  const [addresses, setAddresses] = useState<any[]>(initialAddresses);
  const [showModal, setShowModal] = useState(false);
  const [label, setLabel] = useState("Office");
  const [phone, setPhone] = useState("");
  const [addressStr, setAddressStr] = useState("");
  const [city, setCity] = useState("Pune");
  const [pincode, setPincode] = useState("411001");
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/customers/${customerId}/addresses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label,
          phone,
          address: addressStr,
          city,
          state: "Maharashtra",
          pincode,
          isDefault: addresses.length === 0,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setAddresses([...addresses, data.address]);
        setShowModal(false);
        setPhone("");
        setAddressStr("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (lbl: string) => {
    switch (lbl.toLowerCase()) {
      case "home": return <Home size={16} color="#2563EB" />;
      case "warehouse": return <Warehouse size={16} color="#7C3AED" />;
      case "factory": return <Factory size={16} color="#D97706" />;
      default: return <Building2 size={16} color="var(--brand-red)" />;
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700 }}>Saved Customer Addresses</h3>
        <button type="button" onClick={() => setShowModal(true)} className="btn btn-primary btn-sm" style={{ gap: 4 }}>
          <Plus size={14} /> Add Address
        </button>
      </div>

      <div className="bento-grid">
        {addresses.map((addr) => (
          <div key={addr.id} className="card" style={{ gridColumn: "span 6", padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {getIcon(addr.label)}
                <span style={{ fontWeight: 800, fontSize: 14 }}>{addr.label}</span>
              </div>
              {addr.isDefault && <span className="badge badge-green">Default Pickup</span>}
            </div>
            <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginBottom: 6 }}>{addr.address}</p>
            <div style={{ fontSize: 12, fontWeight: 700 }}>{addr.city}, {addr.state} - {addr.pincode}</div>
            <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 4 }}>Phone: {addr.phone}</div>
          </div>
        ))}

        {addresses.length === 0 && (
          <div className="card" style={{ gridColumn: "span 12", textAlign: "center", padding: 24, color: "var(--text-muted)", fontSize: 13 }}>
            No saved addresses added yet. Click "Add Address" above.
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(3px)", zIndex: 90, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div className="card" style={{ width: 440, padding: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Add Saved Customer Address</h3>
            <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="form-group">
                <label className="label">Address Label (Home, Office, Warehouse, Factory)</label>
                <select className="select" value={label} onChange={(e) => setLabel(e.target.value)}>
                  <option value="Office">Office</option>
                  <option value="Home">Home</option>
                  <option value="Warehouse">Warehouse</option>
                  <option value="Factory">Factory</option>
                </select>
              </div>

              <div className="form-group">
                <label className="label">Contact Phone *</label>
                <input type="text" className="input" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="label">Full Street Address *</label>
                <input type="text" className="input" value={addressStr} onChange={(e) => setAddressStr(e.target.value)} required />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div className="form-group">
                  <label className="label">City</label>
                  <input type="text" className="input" value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="label">Pincode</label>
                  <input type="text" className="input" value={pincode} onChange={(e) => setPincode(e.target.value)} />
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 10 }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost">Cancel</button>
                <button type="submit" disabled={loading} className="btn btn-primary">Save Address</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
