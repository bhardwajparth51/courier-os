import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CustomerBentoDashboard } from "@/components/customer/CustomerBentoDashboard";

export default async function CustomerDashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const customer = await prisma.customer.findUnique({
    where: { userId },
  });

  const [activeShipments, deliveredCount, totalSpend, recentShipments, savedAddresses] = await Promise.all([
    prisma.shipment.count({
      where: {
        customerId: customer?.id,
        status: { notIn: ["DELIVERED", "CANCELLED", "RTO"] },
      },
    }),
    prisma.shipment.count({
      where: { customerId: customer?.id, status: "DELIVERED" },
    }),
    prisma.payment.aggregate({
      where: {
        shipment: { customerId: customer?.id },
        status: "COLLECTED",
      },
      _sum: { amount: true },
    }),
    prisma.shipment.findMany({
      take: 6,
      where: { customerId: customer?.id },
      orderBy: { createdAt: "desc" },
      select: {
        awbNumber: true,
        receiverName: true,
        receiverCity: true,
        receiverState: true,
        status: true,
        serviceType: true,
        totalAmount: true,
        createdAt: true,
        expectedDelivery: true,
      },
    }),
    prisma.savedAddress.findMany({
      take: 3,
      where: { customerId: customer?.id },
    }),
  ]);

  return (
    <CustomerBentoDashboard
      userName={session?.user?.name}
      stats={{
        activeShipments,
        deliveredCount,
        totalSpend: totalSpend._sum.amount ?? 0,
      }}
      recentShipments={recentShipments}
      savedAddresses={savedAddresses}
    />
  );
}
