"use client";

export function FinancialCharts() {
  const methods = [
    { name: "UPI Instant Transfer",   pct: 58 },
    { name: "Counter Cash Payments",  pct: 32 },
    { name: "Credit Account (Corp.)", pct: 10 },
  ];

  const totalExpenses = 45000 + 35000 + 12000 + 6500;
  const expenses = [
    { name: "Branch Rent & Depot Charges",       amount: 45000 },
    { name: "Salary Payments (Staff & Drivers)", amount: 35000 },
    { name: "Fuel & Courier Bag Conveyance",     amount: 12000 },
    { name: "Thermal Paper & Packaging Rolls",   amount:  6500 },
  ];

  const cardStyle: React.CSSProperties = {
    background: "white",
    border: "1px solid var(--border)",
    borderRadius: 10,
    padding: "20px 22px",
    flex: 1,
  };

  return (
    <div style={{ display: "flex", gap: 12 }}>

      {/* Payment mode breakdown */}
      <div style={cardStyle}>
        <p style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.01em", marginBottom: 2 }}>
          Payment Mode Breakdown
        </p>
        <p style={{ fontSize: 11.5, fontWeight: 400, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 20 }}>
          Share of revenue by collection method
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {methods.map((m) => (
            <div key={m.name}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 7 }}>
                <span style={{
                  fontSize: 12.5,
                  fontWeight: 400,
                  color: "var(--text-secondary)",
                  letterSpacing: "-0.005em",
                }}>
                  {m.name}
                </span>
                <span style={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: "var(--text-muted)",
                  letterSpacing: "0.02em",
                }}>
                  {m.pct}%
                </span>
              </div>
              <div style={{ height: 5, background: "var(--bg-muted)", borderRadius: 99, overflow: "hidden" }}>
                <div style={{
                  width: `${m.pct}%`, height: "100%",
                  background: "var(--brand-red)",
                  borderRadius: 99,
                  transition: "width 0.7s ease",
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Overhead expense allocation */}
      <div style={cardStyle}>
        <p style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.01em", marginBottom: 2 }}>
          Overhead Expenses Allocation
        </p>
        <p style={{ fontSize: 11.5, fontWeight: 400, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 20 }}>
          Branch running costs by category
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {expenses.map((e) => {
            const pct = Math.round((e.amount / totalExpenses) * 100);
            return (
              <div key={e.name}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                  <span style={{
                    fontSize: 12.5,
                    fontWeight: 400,
                    color: "var(--text-secondary)",
                    letterSpacing: "-0.005em",
                  }}>
                    {e.name}
                  </span>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 400,
                      color: "var(--text-subtle)",
                    }}>
                      {pct}%
                    </span>
                    <span style={{
                      fontSize: 12.5,
                      fontWeight: 600,
                      fontFamily: "'JetBrains Mono', monospace",
                      color: "var(--text-primary)",
                      letterSpacing: "-0.01em",
                    }}>
                      ₹{e.amount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
                <div style={{ height: 4, background: "var(--bg-muted)", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{
                    width: `${pct}%`, height: "100%",
                    background: "var(--brand-red)",
                    borderRadius: 99,
                    transition: "width 0.7s ease",
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
