import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DeliveryService } from "@/lib/services/delivery.service";

// GET /api/deliveries — Fetch delivery runs
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const runs = await prisma.deliveryRun.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        runShipments: true,
      },
    });

    return NextResponse.json({ runs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/deliveries — Create delivery run
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const run = await DeliveryService.createDeliveryRun(body);

    return NextResponse.json({ run }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
