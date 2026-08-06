import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CustomerBentoDashboard } from "@/components/customer/CustomerBentoDashboard";
import { getCustomerDashboardDemoData } from "@/lib/demoData";

export default async function CustomerDashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  let activeShipments = 0;
  let deliveredCount = 0;
  let totalSpendVal = 0;
  let recentShipments: any[] = [];
  let savedAddresses: any[] = [];

  try {
    const customer = userId
      ? await prisma.customer.findUnique({
          where: { userId },
        })
      : null;

    const [dActive, dDelivered, dSpend, dRecent, dAddresses] = await Promise.all([
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

    activeShipments = dActive;
    deliveredCount = dDelivered;
    totalSpendVal = dSpend._sum.amount ?? 0;
    recentShipments = dRecent;
    savedAddresses = dAddresses;
  } catch (err) {
    console.warn("[CustomerDashboardPage] DB query failed, loading demo fallback:", err);
    const demo = getCustomerDashboardDemoData();
    activeShipments = demo.activeShipments;
    deliveredCount = demo.deliveredCount;
    totalSpendVal = demo.totalSpend;
    recentShipments = demo.recentShipments;
    savedAddresses = demo.savedAddresses;
  }

  return (
    <CustomerBentoDashboard
      userName={session?.user?.name}
      stats={{
        activeShipments,
        deliveredCount,
        totalSpend: totalSpendVal,
      }}
      recentShipments={recentShipments}
      savedAddresses={savedAddresses}
    />
  );
}

