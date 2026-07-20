import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { LogisticsSubNav } from "@/components/navigation/LogisticsSubNav";
import { PickupCalendar } from "@/components/operations/PickupCalendar";

export const dynamic = "force-dynamic";

export default async function OwnerPickupsPage() {
  const pickups = await prisma.pickupRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: { attempts: true },
  });

  const employees = await prisma.employee.findMany({
    where: { isActive: true },
    include: { user: { select: { name: true } } },
  });

  const formattedEmployees = employees.map((e) => ({
    id: e.id,
    name: e.user?.name || e.staffId,
  }));

  return (
    <div>
      <Header title="Pickup Operations" subtitle="Schedule, assign, and track customer doorstep pickups" />
      <div className="page-container">
        <PickupCalendar initialPickups={JSON.parse(JSON.stringify(pickups))} employees={formattedEmployees} />
      </div>
    </div>
  );
}
