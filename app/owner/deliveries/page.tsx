import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { LogisticsSubNav } from "@/components/navigation/LogisticsSubNav";
import { DeliveryRunBoard } from "@/components/operations/DeliveryRunBoard";

export const dynamic = "force-dynamic";

export default async function OwnerDeliveriesPage() {
  const runs = await prisma.deliveryRun.findMany({
    orderBy: { createdAt: "desc" },
    include: { runShipments: true },
  });

  const pendingShipments = await prisma.shipment.findMany({
    where: { status: { in: ["DESTINATION_HUB", "SORTING_CENTER", "COLLECTED"] } },
    take: 50,
  });

  return (
    <div>
      <Header title="Delivery Runs & Proof of Delivery" subtitle="Manage delivery executive runs, POD signature verification, and failed attempts" />
      <div className="page-container">
        <DeliveryRunBoard
          initialRuns={JSON.parse(JSON.stringify(runs))}
          pendingShipments={JSON.parse(JSON.stringify(pendingShipments))}
        />
      </div>
    </div>
  );
}
