import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { LogisticsSubNav } from "@/components/navigation/LogisticsSubNav";
import { CourierBagManager } from "@/components/operations/CourierBagManager";

export const dynamic = "force-dynamic";

export default async function OwnerDispatchPage() {
  const bags = await prisma.courierBag.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      bagShipments: true,
      manifest: true,
    },
  });

  return (
    <div>
      <Header title="Dispatch Operations & Bags" subtitle="Create courier bags, scan AWBs, seal bags, and generate dispatch manifests" />
      <div className="page-container">
        <CourierBagManager initialBags={JSON.parse(JSON.stringify(bags))} />
      </div>
    </div>
  );
}
