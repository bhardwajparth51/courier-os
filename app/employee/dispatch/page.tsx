import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { EmployeeSubNav } from "@/components/navigation/EmployeeSubNav";
import { CourierBagManager } from "@/components/operations/CourierBagManager";

export const dynamic = "force-dynamic";

export default async function EmployeeDispatchPage() {
  const bags = await prisma.courierBag.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      bagShipments: true,
      manifest: true,
    },
  });

  return (
    <div>
      <Header title="Employee Dispatch Queue" subtitle="Bag creation, barcode scanning, seal locking, and manifest printing" />
      <div className="page-container">
        <CourierBagManager initialBags={JSON.parse(JSON.stringify(bags))} />
      </div>
    </div>
  );
}
