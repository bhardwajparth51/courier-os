import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { ShipmentDetailView } from "@/components/shipments/ShipmentDetailView";

export const dynamic = "force-dynamic";

export default async function EmployeeShipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const shipment = await prisma.shipment.findFirst({
    where: { OR: [{ id }, { awbNumber: id }] },
    include: {
      branch: { include: { settings: true } },
      customer: { include: { user: { select: { name: true, email: true, phone: true } } } },
      handledBy: { include: { user: { select: { name: true } } } },
      trackingEvents: { orderBy: { timestamp: "asc" } },
      payment: true,
      invoice: true,
    },
  });

  if (!shipment) notFound();

  const activityLogs = await prisma.activityLog.findMany({
    where: { entity: "Shipment", entityId: shipment.id },
    orderBy: { performedAt: "desc" },
  });

  return (
    <div>
      <Header title={`Shipment: ${shipment.awbNumber}`} subtitle={`Franchise counter details, tracking updates, and receipt printing`} />
      <div className="page-container">
        <ShipmentDetailView
          shipment={JSON.parse(JSON.stringify(shipment))}
          activityLogs={JSON.parse(JSON.stringify(activityLogs))}
          role="EMPLOYEE"
        />
      </div>
    </div>
  );
}
