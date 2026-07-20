import { Header } from "@/components/Header";
import { ManagementSubNav } from "@/components/navigation/ManagementSubNav";
import { Package, ClipboardList, ShieldAlert, ArrowDownUp } from "lucide-react";

export default function OwnerInventoryPage() {
  const inventoryItems = [
    { name: "DTDC Red Flyer Bags (Medium)", sku: "DTDC-FL-M", category: "Flyers", stock: 1240, minStock: 200, status: "IN_STOCK" },
    { name: "DTDC Red Flyer Bags (Large)", sku: "DTDC-FL-L", category: "Flyers", stock: 180, minStock: 250, status: "LOW_STOCK" },
    { name: "DTDC Carton Boxes (5kg)", sku: "DTDC-BX-5K", category: "Cartons", stock: 45, minStock: 50, status: "LOW_STOCK" },
    { name: "DTDC Carton Boxes (10kg)", sku: "DTDC-BX-10K", category: "Cartons", stock: 92, minStock: 30, status: "IN_STOCK" },
    { name: "Sealing Plastic Cable Ties", sku: "DTDC-SL-PL", category: "Security Seals", stock: 2400, minStock: 500, status: "IN_STOCK" },
    { name: "Thermal Label Roll (4x6)", sku: "DTDC-PR-TL", category: "Printer Supplies", stock: 12, minStock: 10, status: "IN_STOCK" },
  ];

  return (
    <div>
      <Header title="Station Packaging & Asset Inventory" subtitle="Monitor flyers, boxes, security bag seals, and printer roll stock levels" />
      <div className="page-container">
        <ManagementSubNav />

        {/* Inventory Summary Grid */}
        <div className="bento-grid" style={{ marginBottom: 20 }}>
          <div className="card" style={{ gridColumn: "span 4", padding: 18 }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>LOW STOCK ALERTS</span>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
              <ShieldAlert size={20} color="var(--brand-red)" />
              <span style={{ fontSize: 20, fontWeight: 800, color: "var(--brand-red)" }}>2 Items</span>
            </div>
          </div>
          <div className="card" style={{ gridColumn: "span 4", padding: 18 }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>TOTAL STOCKED ITEMS</span>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
              <Package size={20} color="#2563EB" />
              <span style={{ fontSize: 20, fontWeight: 800 }}>4,049 units</span>
            </div>
          </div>
          <div className="card" style={{ gridColumn: "span 4", padding: 18 }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>LAST AUDITED BY</span>
            <div style={{ fontSize: 13, fontWeight: 800, marginTop: 10 }}>Poonam Reddy (Staff Coordinator)</div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)", textAlign: "left", fontSize: 11.5, textTransform: "uppercase", color: "var(--text-muted)" }}>
                <th style={{ padding: "12px 16px" }}>Asset / Material Name</th>
                <th style={{ padding: "12px 16px" }}>SKU</th>
                <th style={{ padding: "12px 16px" }}>Category</th>
                <th style={{ padding: "12px 16px", textAlign: "right" }}>Current Stock</th>
                <th style={{ padding: "12px 16px", textAlign: "center" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {inventoryItems.map((item) => (
                <tr key={item.sku} style={{ borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                  <td style={{ padding: "12px 16px", fontWeight: 700 }}>{item.name}</td>
                  <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 12 }}>{item.sku}</td>
                  <td style={{ padding: "12px 16px" }}>{item.category}</td>
                  <td style={{ padding: "12px 16px", textAlign: "right", fontFamily: "monospace", fontWeight: 800 }}>
                    {item.stock} / min {item.minStock}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "center" }}>
                    <span className={item.status === "IN_STOCK" ? "badge badge-green" : "badge badge-red"}>
                      {item.status.replace("_", " ")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
