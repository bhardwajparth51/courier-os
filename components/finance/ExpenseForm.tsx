"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

interface Props {
  onRefresh: () => void;
}

export function ExpenseForm({ onRefresh }: Props) {
  const [vendor, setVendor] = useState("");
  const [category, setCategory] = useState("MISC");
  const [amount, setAmount] = useState("");
  const [gstAmount, setGstAmount] = useState("");
  const [billNumber, setBillNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor || !amount) return;
    setSubmitting(true);

    await fetch("/api/finance/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vendor,
        category,
        amount: Number(amount),
        gstAmount: Number(gstAmount || 0),
        billNumber,
      }),
    });

    setVendor("");
    setAmount("");
    setGstAmount("");
    setBillNumber("");
    setSubmitting(false);
    onRefresh();
  };

  const categories = [
    "RENT",
    "FUEL",
    "ELECTRICITY",
    "INTERNET",
    "SALARY",
    "COURIER_BAGS",
    "THERMAL_ROLLS",
    "PRINTER",
    "PACKAGING",
    "MAINTENANCE",
    "MARKETING",
    "MISC",
  ];

  return (
    <div className="card" style={{ padding: 20 }}>
      <h4 style={{ fontSize: 14, fontWeight: 800, marginBottom: 16 }}>Submit Overhead Expense Voucher</h4>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="form-group">
          <label className="form-label">Vendor Name / Recipient</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Maharashtra State Electricity"
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Category</label>
          <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((c) => (
              <option key={c} value={c}>{c.replace("_", " ")}</option>
            ))}
          </select>
        </div>
        <div className="bento-grid" style={{ gap: 12 }}>
          <div className="form-group" style={{ gridColumn: "span 6" }}>
            <label className="form-label">Total Amount (₹)</label>
            <input
              type="number"
              className="form-input"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="form-group" style={{ gridColumn: "span 6" }}>
            <label className="form-label">Included GST (₹)</label>
            <input
              type="number"
              className="form-input"
              placeholder="0.00"
              value={gstAmount}
              onChange={(e) => setGstAmount(e.target.value)}
            />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Bill / Invoice Number</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. INV-92841"
            value={billNumber}
            onChange={(e) => setBillNumber(e.target.value)}
          />
        </div>
        <button type="submit" disabled={submitting} className="btn btn-primary w-full">
          {submitting ? "Submitting..." : "➕ File Expense Slip"}
        </button>
      </form>
    </div>
  );
}
