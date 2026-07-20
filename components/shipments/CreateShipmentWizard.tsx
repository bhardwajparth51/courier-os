"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ServiceType, ParcelType, PaymentMethod } from "@prisma/client";
import {
  User, MapPin, Package, Truck, Check, ArrowRight, ArrowLeft,
  Printer, FileText, CheckCircle2, ShieldCheck, Banknote, Loader2
} from "lucide-react";
import { calculateShipmentPrice } from "@/lib/pricing";
import { ShippingLabel } from "@/components/shipments/ShippingLabel";
import { GSTInvoice } from "@/components/shipments/GSTInvoice";

interface Props {
  role?: "OWNER" | "EMPLOYEE" | "CUSTOMER";
}

export function CreateShipmentWizard({ role = "EMPLOYEE" }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    senderName: "",
    senderPhone: "",
    senderAddress: "",
    senderCity: "Pune",
    senderState: "Maharashtra",
    senderPincode: "411001",

    receiverName: "",
    receiverPhone: "",
    receiverAddress: "",
    receiverCity: "",
    receiverState: "",
    receiverPincode: "",

    parcelType: "PARCEL" as ParcelType,
    weight: 1.0,
    length: 20,
    width: 15,
    height: 10,
    declaredValue: 1000,
    hasInsurance: false,

    serviceType: "STANDARD" as ServiceType,
    paymentMethod: "CASH" as PaymentMethod,
    codAmount: 0,
  });

  // Created Shipment Response State
  const [createdShipment, setCreatedShipment] = useState<any>(null);
  const [crmCustomer, setCrmCustomer] = useState<any>(null);
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Live Auto-Pricing Calculation
  const pricing = useMemo(() => {
    return calculateShipmentPrice({
      weight: formData.weight,
      length: formData.length,
      width: formData.width,
      height: formData.height,
      parcelType: formData.parcelType,
      serviceType: formData.serviceType,
      hasInsurance: formData.hasInsurance,
      declaredValue: formData.declaredValue,
      paymentMethod: formData.paymentMethod,
      codAmount: formData.codAmount,
    });
  }, [formData]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.senderName || !formData.senderPhone || !formData.senderAddress) {
        setError("Please fill in sender name, phone, and address.");
        return;
      }
    }
    if (step === 2) {
      if (!formData.receiverName || !formData.receiverPhone || !formData.receiverAddress || !formData.receiverCity) {
        setError("Please fill in receiver name, phone, address, and city.");
        return;
      }
    }
    setError("");
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError("");
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/shipments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create shipment");

      setCreatedShipment(data.shipment);
      setStep(6); // Confirmation Step
    } catch (err: any) {
      setError(err.message || "An error occurred during booking.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>

      {/* Steps Indicator Bar */}
      <div className="card" style={{ padding: "16px 24px", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {[
            { num: 1, label: "Sender" },
            { num: 2, label: "Receiver" },
            { num: 3, label: "Parcel Specs" },
            { num: 4, label: "Service" },
            { num: 5, label: "Review" },
            { num: 6, label: "Confirmation" },
          ].map((s, idx) => {
            const active = step === s.num;
            const completed = step > s.num;
            return (
              <div key={s.num} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: "50%",
                  background: active ? "var(--brand-red)" : completed ? "#10B981" : "var(--bg-muted)",
                  color: active || completed ? "white" : "var(--text-muted)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700,
                }}>
                  {completed ? <Check size={14} /> : s.num}
                </div>
                <span style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: active ? "var(--text-primary)" : "var(--text-muted)" }}>
                  {s.label}
                </span>
                {idx < 5 && <div style={{ width: 24, height: 1, background: "var(--border)", margin: "0 4px" }} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid Layout: Form Steps (8 cols) + Live Auto-Pricing Sidebar (4 cols) */}
      <div className="bento-grid">

        {/* Form Container (8 cols) */}
        <div className="card" style={{ gridColumn: step === 6 ? "span 12" : "span 8", padding: 28 }}>
          {error && (
            <div style={{ padding: "10px 14px", borderRadius: 8, background: "#FEE2E2", color: "#DC2626", fontSize: 13, marginBottom: 20 }}>
              {error}
            </div>
          )}

          {/* STEP 1: SENDER */}
          {step === 1 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <User size={18} color="var(--brand-red)" />
                  <h2 style={{ fontSize: 17, fontWeight: 700 }}>Step 1: Sender Information</h2>
                </div>
                {crmCustomer && (
                  <span className="badge badge-green" style={{ fontSize: 11 }}>
                    ★ Health Score: {crmCustomer.healthScore}/100
                  </span>
                )}
              </div>

              {/* Compact CRM Phone Lookup Banner */}
              {crmCustomer && (
                <div style={{ padding: 12, background: "#F0FDF4", border: "1px solid #16A34A", borderRadius: 8, marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ fontWeight: 800, color: "#15803D", fontSize: 13 }}>✓ Existing Account: {crmCustomer.name} {crmCustomer.companyName ? `(${crmCustomer.companyName})` : ""}</span>
                      <div style={{ fontSize: 11.5, color: "#166534", marginTop: 2 }}>
                        GST: <strong>{crmCustomer.gstNumber || "N/A"}</strong> · Code: <strong>{crmCustomer.customerCode}</strong> · Preferred: <strong>{crmCustomer.preferredService}</strong>
                      </div>
                    </div>
                    <span className="badge badge-blue">{crmCustomer.category}</span>
                  </div>

                  {/* Saved Address Quick Select Chips */}
                  {crmCustomer.savedAddresses && crmCustomer.savedAddresses.length > 0 && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px dashed #BBF7D0" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#166534" }}>1-Click Select Saved Address:</span>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                        {crmCustomer.savedAddresses.map((addr: any) => (
                          <button
                            key={addr.id}
                            type="button"
                            onClick={() => {
                              handleChange("senderAddress", addr.address);
                              handleChange("senderCity", addr.city);
                              handleChange("senderPincode", addr.pincode);
                              handleChange("senderState", addr.state);
                            }}
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: 11, padding: "2px 8px", background: "white" }}
                          >
                            📍 {addr.label}: {addr.city} ({addr.pincode})
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="form-group">
                  <label className="label">Sender Phone Number * (Auto-lookups customer)</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. 9822012345"
                    value={formData.senderPhone}
                    onChange={(e) => {
                      const val = e.target.value;
                      handleChange("senderPhone", val);
                      const cleanDigits = val.replace(/\D/g, "");

                      if (cleanDigits.length < 3) {
                        setCrmCustomer(null);
                        return;
                      }

                      if (cleanDigits.length >= 3) {
                        fetch(`/api/customers/lookup?phone=${encodeURIComponent(val.trim())}`)
                          .then((r) => r.json())
                          .then((d) => {
                            if (d.found && d.customer) {
                              setCrmCustomer(d.customer);
                              handleChange("senderName", d.customer.name);
                              if (d.customer.savedAddresses && d.customer.savedAddresses[0]) {
                                const def = d.customer.savedAddresses[0];
                                handleChange("senderAddress", def.address);
                                handleChange("senderCity", def.city);
                                handleChange("senderPincode", def.pincode);
                              }
                            } else {
                              setCrmCustomer(null);
                            }
                          })
                          .catch(() => {});
                      }
                    }}
                    onBlur={(e) => {
                      const val = e.target.value;
                      if (val.trim()) {
                        fetch(`/api/customers/lookup?phone=${encodeURIComponent(val.trim())}`)
                          .then((r) => r.json())
                          .then((d) => {
                            if (d.found && d.customer) {
                              setCrmCustomer(d.customer);
                              handleChange("senderName", d.customer.name);
                              if (d.customer.savedAddresses && d.customer.savedAddresses[0]) {
                                const def = d.customer.savedAddresses[0];
                                handleChange("senderAddress", def.address);
                                handleChange("senderCity", def.city);
                                handleChange("senderPincode", def.pincode);
                              }
                            }
                          })
                          .catch(() => {});
                      }
                    }}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="label">Sender Full Name *</label>
                  <input type="text" className="input" placeholder="e.g. Poonam Reddy" value={formData.senderName} onChange={(e) => handleChange("senderName", e.target.value)} required />
                </div>
                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label className="label">Pickup / Sender Address *</label>
                  <input type="text" className="input" placeholder="House/Shop No, Street Name" value={formData.senderAddress} onChange={(e) => handleChange("senderAddress", e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="label">City</label>
                  <input type="text" className="input" value={formData.senderCity} onChange={(e) => handleChange("senderCity", e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="label">Pincode</label>
                  <input type="text" className="input" value={formData.senderPincode} onChange={(e) => handleChange("senderPincode", e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: RECEIVER */}
          {step === 2 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                <MapPin size={18} color="var(--brand-red)" />
                <h2 style={{ fontSize: 17, fontWeight: 700 }}>Step 2: Receiver Information</h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="form-group">
                  <label className="label">Receiver Name *</label>
                  <input type="text" className="input" placeholder="e.g. Anita Mehta" value={formData.receiverName} onChange={(e) => handleChange("receiverName", e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="label">Phone Number *</label>
                  <input type="text" className="input" placeholder="e.g. +91 98901 67890" value={formData.receiverPhone} onChange={(e) => handleChange("receiverPhone", e.target.value)} required />
                </div>
                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label className="label">Delivery Address *</label>
                  <input type="text" className="input" placeholder="Flat No, Building, Street" value={formData.receiverAddress} onChange={(e) => handleChange("receiverAddress", e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="label">Destination City *</label>
                  <input type="text" className="input" placeholder="e.g. Delhi" value={formData.receiverCity} onChange={(e) => handleChange("receiverCity", e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="label">State / Pincode</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input type="text" className="input" placeholder="State" value={formData.receiverState} onChange={(e) => handleChange("receiverState", e.target.value)} />
                    <input type="text" className="input" placeholder="Pincode" value={formData.receiverPincode} onChange={(e) => handleChange("receiverPincode", e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PARCEL SPECS */}
          {step === 3 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                <Package size={18} color="var(--brand-red)" />
                <h2 style={{ fontSize: 17, fontWeight: 700 }}>Step 3: Parcel & Dimensions</h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="form-group">
                  <label className="label">Parcel Category</label>
                  <select className="select" value={formData.parcelType} onChange={(e) => handleChange("parcelType", e.target.value)}>
                    <option value="PARCEL">Standard Parcel</option>
                    <option value="DOCUMENT">Document / Envelope</option>
                    <option value="FRAGILE">Fragile Items</option>
                    <option value="HEAVY_CARGO">Heavy Cargo</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Weight (kg) *</label>
                  <input type="number" step="0.1" min="0.1" className="input" value={formData.weight} onChange={(e) => handleChange("weight", parseFloat(e.target.value) || 0.5)} />
                </div>

                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label className="label">Dimensions (L x W x H in cm)</label>
                  <div style={{ display: "flex", gap: 10 }}>
                    <input type="number" className="input" placeholder="Length (cm)" value={formData.length} onChange={(e) => handleChange("length", parseFloat(e.target.value) || 0)} />
                    <input type="number" className="input" placeholder="Width (cm)" value={formData.width} onChange={(e) => handleChange("width", parseFloat(e.target.value) || 0)} />
                    <input type="number" className="input" placeholder="Height (cm)" value={formData.height} onChange={(e) => handleChange("height", parseFloat(e.target.value) || 0)} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="label">Declared Parcel Value (₹)</label>
                  <input type="number" className="input" value={formData.declaredValue} onChange={(e) => handleChange("declaredValue", parseFloat(e.target.value) || 0)} />
                </div>

                <div className="form-group">
                  <label className="label">Payment Method</label>
                  <select className="select" value={formData.paymentMethod} onChange={(e) => {
                    const method = e.target.value;
                    handleChange("paymentMethod", method);
                    if (method === "COD") {
                      handleChange("codAmount", formData.declaredValue || 1000);
                    } else {
                      handleChange("codAmount", 0);
                    }
                  }}>
                    <option value="CASH">CASH</option>
                    <option value="UPI">UPI</option>
                    <option value="CARD">CARD</option>
                    <option value="COD">Cash on Delivery (COD)</option>
                  </select>
                </div>

                {formData.paymentMethod === "COD" && (
                  <div className="form-group">
                    <label className="label">COD Amount to Collect (₹)</label>
                    <input type="number" className="input" value={formData.codAmount} onChange={(e) => handleChange("codAmount", parseFloat(e.target.value) || 0)} />
                  </div>
                )}

                <div className="form-group" style={{ justifyContent: "center", gridColumn: formData.paymentMethod === "COD" ? "span 1" : "span 2" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginTop: 22 }}>
                    <input type="checkbox" checked={formData.hasInsurance} onChange={(e) => handleChange("hasInsurance", e.target.checked)} style={{ width: 16, height: 16 }} />
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Add Insurance Cover (2% fee)</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: SERVICE SELECTION */}
          {step === 4 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                <Truck size={18} color="var(--brand-red)" />
                <h2 style={{ fontSize: 17, fontWeight: 700 }}>Step 4: Select Service Type</h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { type: "EXPRESS", name: "DTDC Express", time: "1 Business Day", price: "₹120 base", desc: "Priority air delivery for urgent shipments" },
                  { type: "STANDARD", name: "DTDC Standard", time: "2–3 Business Days", price: "₹60 base", desc: "Reliable ground & air combination" },
                  { type: "SURFACE", name: "DTDC Surface Cargo", time: "4–5 Business Days", price: "₹45 base", desc: "Cost-effective heavy shipment transport" },
                  { type: "INTERNATIONAL", name: "DTDC International", time: "7–12 Business Days", price: "₹850 base", desc: "Global express shipping with customs clearance" },
                ].map((s) => {
                  const isSelected = formData.serviceType === s.type;
                  return (
                    <div
                      key={s.type}
                      onClick={() => handleChange("serviceType", s.type)}
                      style={{
                        padding: 16, borderRadius: 12, border: `2px solid ${isSelected ? "var(--brand-red)" : "var(--border)"}`,
                        background: isSelected ? "var(--brand-red-light)" : "white", cursor: "pointer", transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: isSelected ? "var(--brand-red)" : "#111827" }}>{s.name}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--status-green)" }}>{s.time}</span>
                      </div>
                      <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>{s.desc}</p>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>{s.price}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: INVOICE-STYLE REVIEW & CONFIRM */}
          {step === 5 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                <ShieldCheck size={18} color="var(--brand-red)" />
                <h2 style={{ fontSize: 17, fontWeight: 700 }}>Step 5: Review & Confirm Booking</h2>
              </div>

              {/* Document Review Card */}
              <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 20, background: "#FAFAFA" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, borderBottom: "1px solid var(--border)", paddingBottom: 14, marginBottom: 14 }}>
                  <div>
                    <span style={{ fontSize: 10, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>SENDER:</span>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{formData.senderName}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{formData.senderPhone}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{formData.senderAddress}, {formData.senderCity}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: 10, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>RECEIVER:</span>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{formData.receiverName}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{formData.receiverPhone}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{formData.receiverAddress}, {formData.receiverCity}</div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, borderBottom: "1px solid var(--border)", paddingBottom: 14, marginBottom: 14 }}>
                  <div>
                    <span style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase" }}>PARCEL WEIGHT</span>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{formData.weight} kg</div>
                  </div>
                  <div>
                    <span style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase" }}>SERVICE TYPE</span>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "var(--brand-red)" }}>{formData.serviceType}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase" }}>PAYMENT METHOD</span>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{formData.paymentMethod}</div>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Estimated Delivery:</span>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--status-green)" }}>
                      {new Date(Date.now() + 86400000 * (formData.serviceType === "EXPRESS" ? 1 : 3)).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Total Payable (incl. GST):</span>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)" }}>₹{pricing.total}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: CONFIRMATION & ACTIONS */}
          {step === 6 && createdShipment && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ width: 56, height: 56, background: "#DCFCE7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <CheckCircle2 size={32} color="#16A34A" />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111827" }}>Shipment Booked Successfully!</h2>
              <div style={{ fontSize: 16, fontFamily: "monospace", fontWeight: 700, color: "var(--brand-red)", margin: "8px 0 16px" }}>
                AWB: {createdShipment.awbNumber}
              </div>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>
                Shipment record saved. Printable label and invoice generated.
              </p>

              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <button type="button" onClick={() => setShowLabelModal(true)} className="btn btn-secondary" style={{ gap: 6 }}>
                  <Printer size={15} />
                  Print Thermal Label
                </button>
                <button type="button" onClick={() => setShowInvoiceModal(true)} className="btn btn-secondary" style={{ gap: 6 }}>
                  <FileText size={15} />
                  Print Tax Invoice
                </button>
                <button type="button" onClick={() => router.push(`/owner/shipments/${createdShipment.id}`)} className="btn btn-primary">
                  View Details Page
                </button>
              </div>
            </div>
          )}

          {/* Navigation Control Buttons */}
          {step < 6 && (
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
              {step > 1 ? (
                <button type="button" onClick={handleBack} className="btn btn-ghost" style={{ gap: 6 }}>
                  <ArrowLeft size={15} /> Back
                </button>
              ) : <div />}

              {step < 5 ? (
                <button type="button" onClick={handleNext} className="btn btn-primary" style={{ gap: 6 }}>
                  Continue <ArrowRight size={15} />
                </button>
              ) : (
                <button type="button" onClick={handleSubmit} disabled={loading} className="btn btn-primary" style={{ gap: 6, padding: "10px 24px" }}>
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  Confirm & Generate AWB
                </button>
              )}
            </div>
          )}
        </div>

        {/* Live Auto-Pricing Breakdown Sidebar (4 cols) */}
        {step < 6 && (
          <div className="card" style={{ gridColumn: "span 4", padding: 22, height: "fit-content" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>
              <Banknote size={18} color="var(--brand-red)" />
              <span style={{ fontWeight: 700, fontSize: 14.5 }}>Live Pricing Engine</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 12.5 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Base Service Charge:</span>
                <span style={{ fontWeight: 600 }}>₹{pricing.baseCharge}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Weight Charge ({pricing.billableWeight} kg):</span>
                <span style={{ fontWeight: 600 }}>₹{pricing.weightCharge}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Distance Zone Charge:</span>
                <span style={{ fontWeight: 600 }}>₹{pricing.distanceCharge}</span>
              </div>
              {pricing.insuranceCharge > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", color: "#16A34A" }}>
                  <span>Insurance Cover (2%):</span>
                  <span style={{ fontWeight: 600 }}>₹{pricing.insuranceCharge}</span>
                </div>
              )}
              {pricing.codCharge > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", color: "#D97706" }}>
                  <span>COD Handling Fee:</span>
                  <span style={{ fontWeight: 600 }}>₹{pricing.codCharge}</span>
                </div>
              )}
              <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)" }}>
                <span>Subtotal:</span>
                <span>₹{pricing.subtotal}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)" }}>
                <span>GST Tax (18%):</span>
                <span>₹{pricing.tax}</span>
              </div>
              <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 800, color: "var(--brand-red)" }}>
                <span>Total Amount:</span>
                <span>₹{pricing.total}</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Modals for Label & Invoice */}
      {showLabelModal && createdShipment && (
        <ShippingLabel shipment={createdShipment} onClose={() => setShowLabelModal(false)} />
      )}
      {showInvoiceModal && createdShipment && (
        <GSTInvoice shipment={createdShipment} onClose={() => setShowInvoiceModal(false)} />
      )}

    </div>
  );
}
