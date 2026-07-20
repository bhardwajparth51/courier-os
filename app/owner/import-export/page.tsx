"use client";

import { useState } from "react";
import {
  Download, Upload, FileSpreadsheet, FileJson,
  CheckCircle2, XCircle, AlertCircle, ChevronDown,
} from "lucide-react";

type ExportType = {
  key: string;
  label: string;
  desc: string;
  hasDates?: boolean;
  hasStatus?: boolean;
  statusOptions?: string[];
  icon: string;
};

const EXPORTS: ExportType[] = [
  { key: "shipments", label: "Shipments",       desc: "All bookings with AWB, sender, receiver, status, amount", hasDates: true, hasStatus: true, statusOptions: ["BOOKED","IN_TRANSIT","DELIVERED","RETURNED"], icon: "📦" },
  { key: "customers", label: "Customers",        desc: "Full customer list with outstanding balances",                                                     icon: "👥" },
  { key: "finance",   label: "Finance (4 sheets)",desc: "Cash transactions, expenses, invoices, COD settlements", hasDates: true,                           icon: "💰" },
  { key: "cod",       label: "COD Settlements",  desc: "COD collection status and reconciliation",              hasDates: true,                              icon: "💵" },
  { key: "employees", label: "Employees",         desc: "Staff directory with salary and designation",                                                       icon: "👤" },
  { key: "rates",     label: "Rate Card",         desc: "Zone × service × weight slab price matrix",                                                         icon: "📋" },
];

const IMPORT_TYPES = [
  { key: "customers", label: "Customers",        desc: "Name, Phone, Email, City, State", templateType: "template-customers" },
  { key: "pincodes",  label: "Zone Pincodes",    desc: "Pincode, City, State, Zone Code", templateType: "template-pincodes"  },
  { key: "employees", label: "Employees",         desc: "Name, Email, Phone, Designation, Salary" },
];

export default function ImportExportPage() {
  const [activeSection, setActiveSection] = useState<"export" | "import">("export");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filters, setFilters] = useState<Record<string, { from: string; to: string; status: string }>>({});
  const [downloading, setDownloading] = useState<string | null>(null);

  // Import state
  const [importType, setImportType] = useState("customers");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  const getFilter = (key: string) => filters[key] ?? { from: "", to: "", status: "" };
  const setFilter = (key: string, field: string, val: string) =>
    setFilters(f => ({ ...f, [key]: { ...getFilter(key), [field]: val } }));

  const download = async (type: string, isJson = false) => {
    setDownloading(type);
    const f = getFilter(type);
    const params = new URLSearchParams({ type });
    if (f.from)   params.set("from",   f.from);
    if (f.to)     params.set("to",     f.to);
    if (f.status) params.set("status", f.status);

    const res = await fetch(`/api/data?${params}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = res.headers.get("content-disposition")?.match(/filename="(.+)"/)?.[1]
      ?? `export_${type}_${new Date().toISOString().slice(0,10)}.${isJson ? "json" : "xlsx"}`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloading(null);
  };

  const downloadTemplate = async (templateType: string) => {
    const res = await fetch(`/api/data?type=${templateType}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = res.headers.get("content-disposition")?.match(/filename="(.+)"/)?.[1] ?? "template.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  };

  const doImport = async () => {
    if (!importFile) return;
    setImporting(true);
    setImportResult(null);
    const fd = new FormData();
    fd.append("file", importFile);
    const res = await fetch(`/api/data?type=${importType}`, { method: "POST", body: fd });
    const d = await res.json();
    setImportResult(d);
    setImporting(false);
  };

  return (
    <div className="page-container" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4 }}>Import & Export</h2>
        <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
          Download data as Excel spreadsheets or import records in bulk.
        </p>
      </div>

      {/* Toggle */}
      <div style={{ display: "flex", gap: 2, background: "var(--bg-muted)", borderRadius: 9, padding: 4, border: "1px solid var(--border)", width: "fit-content" }}>
        {([["export", "Export Data", Download], ["import", "Import Data", Upload]] as const).map(([id, label, Icon]) => (
          <button key={id} onClick={() => setActiveSection(id as any)} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "7px 16px", borderRadius: 7, border: "none",
            background: activeSection === id ? "white" : "transparent",
            color: activeSection === id ? "var(--text-primary)" : "var(--text-muted)",
            fontSize: 13, fontWeight: activeSection === id ? 600 : 500, cursor: "pointer",
            boxShadow: activeSection === id ? "0 1px 3px rgba(0,0,0,0.07)" : "none",
            transition: "all 0.15s",
          }}>
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {/* EXPORT SECTION */}
      {activeSection === "export" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Backup buttons */}
          <div style={{ ...card, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: 13.5, fontWeight: 700, letterSpacing: "-0.01em" }}>Full Backup</p>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Export all data as a single JSON file (up to 10,000 records per table)</p>
            </div>
            <button onClick={() => download("backup-json", true)} disabled={downloading === "backup-json"} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 16px", borderRadius: 7,
              background: "#1E293B", color: "white", border: "none",
              fontSize: 12.5, fontWeight: 600, cursor: "pointer",
            }}>
              <FileJson size={13} /> {downloading === "backup-json" ? "Preparing…" : "Download JSON Backup"}
            </button>
          </div>

          {/* Per-entity exports */}
          {EXPORTS.map((exp) => (
            <div key={exp.key} style={card}>
              <div style={{ padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
                onClick={() => setExpanded(e => e === exp.key ? null : exp.key)}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 20 }}>{exp.icon}</span>
                  <div>
                    <p style={{ fontSize: 13.5, fontWeight: 700 }}>{exp.label}</p>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{exp.desc}</p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); download(exp.key); }}
                    disabled={downloading === exp.key}
                    style={{
                      display: "flex", alignItems: "center", gap: 5,
                      padding: "7px 14px", borderRadius: 7, border: "none",
                      background: "var(--brand-red)", color: "white",
                      fontSize: 12, fontWeight: 600, cursor: "pointer",
                    }}
                  >
                    <FileSpreadsheet size={12} /> {downloading === exp.key ? "Preparing…" : "Export XLSX"}
                  </button>
                  {(exp.hasDates || exp.hasStatus) && (
                    <ChevronDown size={15} color="var(--text-muted)" style={{ transform: expanded === exp.key ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                  )}
                </div>
              </div>

              {/* Filters */}
              {expanded === exp.key && (
                <div style={{ padding: "0 20px 16px", borderTop: "1px solid var(--border-subtle)", display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {exp.hasDates && (
                    <>
                      <div>
                        <label style={lbl}>From Date</label>
                        <input type="date" style={filterInput} value={getFilter(exp.key).from}
                          onChange={e => setFilter(exp.key, "from", e.target.value)} />
                      </div>
                      <div>
                        <label style={lbl}>To Date</label>
                        <input type="date" style={filterInput} value={getFilter(exp.key).to}
                          onChange={e => setFilter(exp.key, "to", e.target.value)} />
                      </div>
                    </>
                  )}
                  {exp.hasStatus && exp.statusOptions && (
                    <div>
                      <label style={lbl}>Status Filter</label>
                      <select style={filterInput} value={getFilter(exp.key).status}
                        onChange={e => setFilter(exp.key, "status", e.target.value)}>
                        <option value="">All Statuses</option>
                        {exp.statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* IMPORT SECTION */}
      {activeSection === "import" && (
        <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 14 }}>
          {/* Import form */}
          <div style={{ ...card, padding: "20px 22px" }}>
            <h4 style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 16 }}>Import Records</h4>

            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Import Type</label>
              <select className="form-input" value={importType} onChange={e => { setImportType(e.target.value); setImportResult(null); }}>
                {IMPORT_TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Required Columns</label>
              <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>
                {IMPORT_TYPES.find(t => t.key === importType)?.desc}
              </p>
            </div>

            {IMPORT_TYPES.find(t => t.key === importType)?.templateType && (
              <button onClick={() => downloadTemplate(IMPORT_TYPES.find(t => t.key === importType)!.templateType!)} style={{
                display: "flex", alignItems: "center", gap: 5, marginBottom: 14,
                padding: "6px 12px", borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: "pointer",
                border: "1px solid var(--border)", background: "var(--bg-muted)", color: "var(--text-secondary)",
              }}>
                <Download size={12} /> Download Template
              </button>
            )}

            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Upload XLSX File</label>
              <label style={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                padding: "24px 16px", border: "2px dashed var(--border)", borderRadius: 8,
                cursor: "pointer", background: importFile ? "#F0FDF4" : "var(--bg-muted)",
                transition: "all 0.2s",
              }}>
                <input type="file" accept=".xlsx,.xls,.csv" style={{ display: "none" }}
                  onChange={e => { setImportFile(e.target.files?.[0] ?? null); setImportResult(null); }} />
                {importFile
                  ? <><FileSpreadsheet size={20} color="#15803D" /><p style={{ fontSize: 12, color: "#15803D", fontWeight: 600, marginTop: 6 }}>{importFile.name}</p></>
                  : <><Upload size={20} color="var(--text-muted)" /><p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>Click to choose file</p><p style={{ fontSize: 11, color: "var(--text-subtle)", marginTop: 2 }}>XLSX, XLS, CSV accepted</p></>
                }
              </label>
            </div>

            <button onClick={doImport} disabled={!importFile || importing} style={{
              width: "100%", padding: "9px 0", borderRadius: 7, border: "none",
              background: !importFile ? "var(--bg-muted)" : "var(--brand-red)",
              color: !importFile ? "var(--text-muted)" : "white",
              fontSize: 13, fontWeight: 600, cursor: importFile ? "pointer" : "not-allowed",
              transition: "all 0.15s",
            }}>
              {importing ? "Importing…" : "Start Import"}
            </button>
          </div>

          {/* Result panel */}
          <div style={{ ...card, padding: "20px 24px" }}>
            {!importResult ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 8 }}>
                <Upload size={28} color="var(--text-subtle)" strokeWidth={1.5} />
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Upload a file and click Start Import to see results here.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Summary */}
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ flex: 1, padding: "14px 16px", borderRadius: 8, background: "#F0FDF4", border: "1px solid #A7F3D0" }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: "#15803D", textTransform: "uppercase", letterSpacing: "0.07em" }}>Inserted / Updated</p>
                    <p style={{ fontSize: 28, fontWeight: 700, color: "#14532D", fontFamily: "Outfit, sans-serif" }}>{importResult.inserted}</p>
                  </div>
                  <div style={{ flex: 1, padding: "14px 16px", borderRadius: 8, background: importResult.skipped > 0 ? "#FEF2F2" : "#F9FAFB", border: `1px solid ${importResult.skipped > 0 ? "#FCA5A5" : "var(--border)"}` }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: importResult.skipped > 0 ? "#DC2626" : "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Skipped / Errors</p>
                    <p style={{ fontSize: 28, fontWeight: 700, color: importResult.skipped > 0 ? "#7F1D1D" : "var(--text-muted)", fontFamily: "Outfit, sans-serif" }}>{importResult.skipped}</p>
                  </div>
                  <div style={{ flex: 1, padding: "14px 16px", borderRadius: 8, background: "var(--bg-muted)", border: "1px solid var(--border)" }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Overall Status</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                      {importResult.success
                        ? <CheckCircle2 size={20} color="#15803D" />
                        : <AlertCircle size={20} color="#D97706" />
                      }
                      <p style={{ fontSize: 14, fontWeight: 700 }}>{importResult.success ? "Success" : "Partial"}</p>
                    </div>
                  </div>
                </div>

                {/* Errors */}
                {importResult.errors?.length > 0 && (
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "#DC2626", marginBottom: 8 }}>Errors ({importResult.errors.length})</p>
                    <div style={{ maxHeight: 240, overflowY: "auto", border: "1px solid #FCA5A5", borderRadius: 7, background: "#FEF2F2" }}>
                      {importResult.errors.map((e: string, i: number) => (
                        <div key={i} style={{ padding: "7px 12px", borderBottom: i < importResult.errors.length - 1 ? "1px solid #FCA5A580" : "none", display: "flex", gap: 8 }}>
                          <XCircle size={13} color="#DC2626" style={{ flexShrink: 0, marginTop: 1 }} />
                          <p style={{ fontSize: 12, color: "#7F1D1D", lineHeight: 1.5 }}>{e}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const card: React.CSSProperties = {
  background: "white", border: "1px solid var(--border)",
  borderRadius: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
};

const lbl: React.CSSProperties = {
  display: "block", fontSize: 11.5, fontWeight: 600,
  color: "var(--text-muted)", marginBottom: 5,
};

const filterInput: React.CSSProperties = {
  fontSize: 13, padding: "7px 10px", borderRadius: 7,
  border: "1px solid var(--border)", background: "white",
};
