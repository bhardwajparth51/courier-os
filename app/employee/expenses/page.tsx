"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { EmployeeSubNav } from "@/components/navigation/EmployeeSubNav";
import { ExpenseTable } from "@/components/finance/ExpenseTable";
import { ExpenseForm } from "@/components/finance/ExpenseForm";

export default function EmployeeExpensesPage() {
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
      <Header title="Operating Expense Claims" subtitle="File new stationery, fuel, or petty overhead claims for owner approval" />
      <div className="page-container">
        <EmployeeSubNav />
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Loading overhead vouchers...</div>
        ) : (
          <div className="bento-grid">
            <div style={{ gridColumn: "span 4" }}>
              <ExpenseForm onRefresh={fetchExpenses} />
            </div>
            <div style={{ gridColumn: "span 8" }}>
              <ExpenseTable expenses={expenses} role="EMPLOYEE" onRefresh={fetchExpenses} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
