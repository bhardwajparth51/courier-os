import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { LogisticsSubNav } from "@/components/navigation/LogisticsSubNav";
import { ShipmentTable } from "@/components/shipments/ShipmentTable";
import Link from "next/link";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OwnerShipmentsPage() {
  const shipments = await prisma.shipment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      payment: { select: { status: true, method: true } },
      branch: { select: { name: true, city: true, phone: true } },
    },
    take: 100,
  });

  return (
    <div>
      <Header title="All Shipments & Consignments" subtitle="Search, filter, and track all franchise bookings" />

      <div className="page-container">
        <LogisticsSubNav />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800 }}>Operational Shipments</h1>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Total {shipments.length} active shipments in franchise network</p>
          </div>

          <Link href="/owner/shipments/new" className="btn btn-primary" style={{ gap: 6 }}>
            <Plus size={16} /> New Shipment
          </Link>
        </div>

        <ShipmentTable initialShipments={JSON.parse(JSON.stringify(shipments))} role="OWNER" />
      </div>
    </div>
  );
}
