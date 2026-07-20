"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { FinanceSubNav } from "@/components/navigation/FinanceSubNav";
import { ExpenseTable } from "@/components/finance/ExpenseTable";
import { ExpenseForm } from "@/components/finance/ExpenseForm";

export default function OwnerExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = () => {
    fetch("/api/finance/expenses")
      .then((res) => res.json())
      .then((data) => {
        setExpenses(data.expenses || []);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  return (
    <div>
      <Header title="Station Operating Overheads & Expenses" subtitle="Submit utility vouchers, process employee petty claims, and track monthly burn rates" />
      <div className="page-container">
        <FinanceSubNav />
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Loading overhead vouchers...</div>
        ) : (
          <div className="bento-grid">
            <div style={{ gridColumn: "span 4" }}>
              <ExpenseForm onRefresh={fetchExpenses} />
            </div>
            <div style={{ gridColumn: "span 8" }}>
              <ExpenseTable expenses={expenses} role="OWNER" onRefresh={fetchExpenses} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
