import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { EmployeeSubNav } from "@/components/navigation/EmployeeSubNav";
import { DeliveryRunBoard } from "@/components/operations/DeliveryRunBoard";

export const dynamic = "force-dynamic";

export default async function EmployeeDeliveriesPage() {
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
      <Header title="Employee Delivery Command" subtitle="Process proof of delivery (POD) and record delivery attempt resolutions" />
      <div className="page-container">
        <EmployeeSubNav />
        <DeliveryRunBoard
          initialRuns={JSON.parse(JSON.stringify(runs))}
          pendingShipments={JSON.parse(JSON.stringify(pendingShipments))}
        />
      </div>
    </div>
  );
}
