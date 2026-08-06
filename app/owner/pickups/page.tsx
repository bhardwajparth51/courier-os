import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { LogisticsSubNav } from "@/components/navigation/LogisticsSubNav";
import { PickupCalendar } from "@/components/operations/PickupCalendar";

export const dynamic = "force-dynamic";

export default async function OwnerPickupsPage() {
  let pickups: any[] = [];
  let formattedEmployees: any[] = [];

  try {
    const rawPickups = await prisma.pickupRequest.findMany({
      orderBy: { createdAt: "desc" },
      include: { attempts: true },
    });
    pickups = rawPickups;

    const employees = await prisma.employee.findMany({
      where: { isActive: true },
      include: { user: { select: { name: true } } },
    });

    formattedEmployees = employees.map((e) => ({
      id: e.id,
      name: e.user?.name || e.staffId,
    }));
  } catch (err) {
    console.warn("[OwnerPickupsPage] DB query failed, using empty fallback:", err);
  }

  return (
    <div>
      <Header title="Pickup Operations" subtitle="Schedule, assign, and track customer doorstep pickups" />
      <div className="page-container">
        <PickupCalendar initialPickups={JSON.parse(JSON.stringify(pickups))} employees={formattedEmployees} />
      </div>
    </div>
  );
}
