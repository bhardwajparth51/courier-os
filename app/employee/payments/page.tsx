import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { EmployeeSubNav } from "@/components/navigation/EmployeeSubNav";

export const dynamic = "force-dynamic";

export default async function EmployeePaymentsPage() {
  const shipments = await prisma.shipment.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      awbNumber: true,
      createdAt: true,
      senderName: true,
      totalAmount: true,
      paymentMethod: true,
      status: true,
    },
  });

  const totalCollected = shipments.reduce((acc, s) => acc + (s.totalAmount || 0), 0);

  return (
    <div>
      <Header title="Station Cashier & Payments Ledger" subtitle="Monitor cash, UPI, and COD collections at the franchise counter" />
      <div className="page-container">
        <EmployeeSubNav />

        {/* Executive summary card */}
        <div className="bento-grid" style={{ marginBottom: 20 }}>
          <div className="card" style={{ gridColumn: "span 6", padding: 20 }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>TODAY'S COUNTER COLLECTIONS</span>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: "#16A34A", marginTop: 6 }}>
              ₹{totalCollected.toLocaleString("en-IN")}
            </h2>
          </div>
          <div className="card" style={{ gridColumn: "span 6", padding: 20 }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>COLLECTED CONSIGNMENTS</span>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginTop: 6 }}>
              {shipments.length} AWBs
            </h2>
          </div>
        </div>

        {/* Payments Table */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", fontWeight: 700 }}>
            Real-time Payment Collection Register
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)", textAlign: "left", fontSize: 11.5, textTransform: "uppercase", color: "var(--text-muted)" }}>
                <th style={{ padding: "12px 16px" }}>AWB Number</th>
                <th style={{ padding: "12px 16px" }}>Sender Name</th>
                <th style={{ padding: "12px 16px" }}>Payment Method</th>
                <th style={{ padding: "12px 16px", textAlign: "right" }}>Amount Collected</th>
                <th style={{ padding: "12px 16px", textAlign: "center" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((s) => (
                <tr key={s.id} style={{ borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                  <td style={{ padding: "12px 16px", fontFamily: "monospace", fontWeight: 800 }}>{s.awbNumber}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 700 }}>{s.senderName}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span className="badge badge-blue">{s.paymentMethod}</span>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right", fontFamily: "monospace", fontWeight: 800 }}>
                    ₹{s.totalAmount.toLocaleString("en-IN")}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "center" }}>
                    <span className="badge badge-green">PAID</span>
                  </td>
                </tr>
              ))}

              {shipments.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                    No payment transactions recorded today.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
