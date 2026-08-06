import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { prisma } from "../lib/prisma";

async function main() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const ninetyDaysAgo = new Date(today);
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 89);

  console.log("Running Promise.all queries...");
  try {
    const results = await Promise.all([
      prisma.shipment.count({ where: { createdAt: { gte: today, lt: tomorrow } } }),
      prisma.shipment.count({ where: { status: "DELIVERED", updatedAt: { gte: today, lt: tomorrow } } }),
      prisma.shipment.count({ where: { status: { in: ["AWAITING_PICKUP", "BOOKED"] } } }),
      prisma.payment.aggregate({
        where: { createdAt: { gte: today, lt: tomorrow }, status: "COLLECTED" },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: { method: "COD", status: "COLLECTED", createdAt: { gte: today, lt: tomorrow } },
        _sum: { codAmount: true },
      }),
      prisma.customer.count(),
      prisma.shipment.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          awbNumber: true,
          receiverCity: true,
          receiverState: true,
          status: true,
          totalAmount: true,
          serviceType: true,
          createdAt: true,
          senderName: true,
          receiverName: true,
          paymentMethod: true,
        },
      }),
      prisma.shipment.findMany({
        where: { createdAt: { gte: ninetyDaysAgo } },
        select: { createdAt: true, totalAmount: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.shipment.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
      prisma.shipment.groupBy({
        by: ["serviceType"],
        _count: { serviceType: true },
      }),
      prisma.shipment.groupBy({
        by: ["receiverCity"],
        _count: { receiverCity: true },
        orderBy: { _count: { receiverCity: "desc" } },
        take: 6,
      }),
      prisma.inventory.findMany({
        where: { currentStock: { lte: 15 } },
        take: 4,
        orderBy: { currentStock: "asc" },
      }),
      prisma.trackingEvent.findMany({
        take: 6,
        orderBy: { timestamp: "desc" },
        include: { shipment: { select: { awbNumber: true } } },
      }),
    ]);
    console.log("SUCCESS! Query results counts:", results.map(r => Array.isArray(r) ? r.length : typeof r === 'object' ? JSON.stringify(r) : r));
  } catch (err) {
    console.error("ERROR running queries:", err);
  }
}

main().finally(() => process.exit(0));
