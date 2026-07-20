"use client";

import { useState } from "react";
import { FileText, Plus, ShieldCheck, CheckCircle2 } from "lucide-react";

interface Props {
  customerId: string;
  initialDocuments: any[];
}

export function CustomerDocuments({ customerId, initialDocuments }: Props) {
  const [documents, setDocuments] = useState<any[]>(initialDocuments);
  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState<"GST" | "PAN" | "AADHAR" | "BUSINESS_LICENSE" | "CANCELLED_CHEQUE" | "OTHER">("GST");
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/customers/${customerId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          fileName,
          fileUrl: `/docs/${type}_${Date.now()}.pdf`,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setDocuments([data.document, ...documents]);
        setShowModal(false);
        setFileName("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700 }}>KYC & Business Verification Documents</h3>
        <button type="button" onClick={() => setShowModal(true)} className="btn btn-primary btn-sm" style={{ gap: 4 }}>
          <Plus size={14} /> Upload Document
        </button>
      </div>

      <div className="bento-grid">
        {documents.map((doc) => (
          <div key={doc.id} className="card" style={{ gridColumn: "span 6", padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FileText size={20} color="var(--brand-red)" />
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>{doc.fileName || `${doc.type} Document`}</div>
                  <span className="badge badge-blue" style={{ fontSize: 10, marginTop: 2 }}>{doc.type}</span>
                </div>
              </div>
              <span className="badge badge-green" style={{ gap: 4 }}>
                <ShieldCheck size={12} /> VERIFIED
              </span>
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 10 }}>
              Uploaded: {new Date(doc.uploadedAt).toLocaleDateString("en-IN")}
            </div>
          </div>
        ))}

        {documents.length === 0 && (
          <div className="card" style={{ gridColumn: "span 12", textAlign: "center", padding: 24, color: "var(--text-muted)", fontSize: 13 }}>
            No KYC or business documents uploaded yet.
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(3px)", zIndex: 90, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div className="card" style={{ width: 420, padding: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Upload KYC / Business Document</h3>
            <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="form-group">
                <label className="label">Document Type</label>
                <select className="select" value={type} onChange={(e) => setType(e.target.value as any)}>
                  <option value="GST">GST Registration Certificate</option>
                  <option value="PAN">PAN Card</option>
                  <option value="AADHAR">Aadhaar Card</option>
                  <option value="BUSINESS_LICENSE">Shop & Establishment License</option>
                  <option value="CANCELLED_CHEQUE">Cancelled Cheque</option>
                  <option value="OTHER">Other Agreement / Contract</option>
                </select>
              </div>

              <div className="form-group">
                <label className="label">Document Name / File Title *</label>
                <input type="text" className="input" placeholder="e.g. GST_Certificate_2026.pdf" value={fileName} onChange={(e) => setFileName(e.target.value)} required />
              </div>

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 10 }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost">Cancel</button>
                <button type="submit" disabled={loading} className="btn btn-primary">Save Document</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
