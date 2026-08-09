import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { ShipmentDetailView } from "@/components/shipments/ShipmentDetailView";

import { getDemoShipmentDetail } from "@/lib/demoData";

export const dynamic = "force-dynamic";

export default async function OwnerShipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let shipment: any = null;
  let activityLogs: any[] = [];

  try {
    shipment = await prisma.shipment.findFirst({
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

    if (shipment) {
      activityLogs = await prisma.activityLog.findMany({
        where: { entity: "Shipment", entityId: shipment.id },
        orderBy: { performedAt: "desc" },
      });
    }
  } catch (err) {
    shipment = getDemoShipmentDetail(id);
    activityLogs = [];
  }

  if (!shipment) {
    shipment = getDemoShipmentDetail(id);
  }

  return (
    <div>
      <Header title={`Shipment: ${shipment.awbNumber}`} subtitle={`Franchise details, vertical timeline, and audit logs`} />
      <div className="page-container">
        <ShipmentDetailView
          shipment={JSON.parse(JSON.stringify(shipment))}
          activityLogs={JSON.parse(JSON.stringify(activityLogs))}
          role="OWNER"
        />
      </div>
    </div>
  );
}
