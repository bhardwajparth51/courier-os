"use client";

import { Check, X } from "lucide-react";

interface Props {
  expenses: any[];
  role: "OWNER" | "EMPLOYEE";
  onRefresh: () => void;
}

export function ExpenseTable({ expenses, role, onRefresh }: Props) {
  const handleApprove = async (expenseId: string) => {
    await fetch("/api/finance/expenses", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expenseId }),
    });
    onRefresh();
  };

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", fontWeight: 700 }}>
        Overhead Expenses ledger
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)", textAlign: "left", fontSize: 11.5, textTransform: "uppercase", color: "var(--text-muted)" }}>
            <th style={{ padding: "12px 16px" }}>Filing Date</th>
            <th style={{ padding: "12px 16px" }}>Category</th>
            <th style={{ padding: "12px 16px" }}>Vendor / Description</th>
            <th style={{ padding: "12px 16px" }}>Bill No.</th>
            <th style={{ padding: "12px 16px", textAlign: "right" }}>Amount</th>
            <th style={{ padding: "12px 16px", textAlign: "center" }}>Status</th>
            {role === "OWNER" && <th style={{ padding: "12px 16px", textAlign: "center" }}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {expenses.map((e) => (
            <tr key={e.id} style={{ borderBottom: "1px solid var(--border)", fontSize: 13.5 }}>
              <td style={{ padding: "12px 16px", color: "var(--text-muted)" }}>
                {new Date(e.createdAt).toLocaleDateString("en-IN")}
              </td>
              <td style={{ padding: "12px 16px" }}>
                <span className="badge badge-blue">{e.category}</span>
              </td>
              <td style={{ padding: "12px 16px", fontWeight: 700 }}>
                {e.vendor}
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Filed by: {e.submittedBy}</div>
              </td>
              <td style={{ padding: "12px 16px", fontFamily: "monospace" }}>{e.billNumber || "N/A"}</td>
              <td style={{ padding: "12px 16px", textAlign: "right", fontFamily: "monospace", fontWeight: 800 }}>
                ₹{e.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </td>
              <td style={{ padding: "12px 16px", textAlign: "center" }}>
                <span className={`badge ${e.status === "APPROVED" ? "badge-green" : e.status === "REJECTED" ? "badge-red" : "badge-yellow"}`}>
                  {e.status}
                </span>
              </td>
              {role === "OWNER" && (
                <td style={{ padding: "12px 16px", textAlign: "center" }}>
                  {e.status === "PENDING" ? (
                    <button
                      onClick={() => handleApprove(e.id)}
                      className="btn btn-sm btn-primary"
                      style={{ gap: 4, background: "#16A34A", border: "none", color: "white", padding: "4px 8px" }}
                    >
                      <Check size={12} /> Approve
                    </button>
                  ) : (
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Reconciled</span>
                  )}
                </td>
              )}
            </tr>
          ))}

          {expenses.length === 0 && (
            <tr>
              <td colSpan={role === "OWNER" ? 7 : 6} style={{ padding: 24, textAlign: "center", color: "var(--text-muted)" }}>
                No overhead expenses recorded yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
