import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PickupService } from "@/lib/services/pickup.service";

// GET /api/pickups — Fetch pickups list
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const filter = searchParams.get("filter"); // "TODAY", "ASSIGNED", "PENDING", "COMPLETED"

    let where: any = {};

    if (filter === "TODAY") {
      const todayStr = new Date().toISOString().slice(0, 10);
      where.scheduledDate = {
        gte: new Date(todayStr),
        lte: new Date(todayStr + "T23:59:59.999Z"),
      };
    } else if (filter === "ASSIGNED") {
      where.status = "ASSIGNED";
    } else if (filter === "PENDING") {
      where.status = "PENDING";
    } else if (filter === "COMPLETED") {
      where.status = "COMPLETED";
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    const pickups = await prisma.pickupRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { attempts: { orderBy: { createdAt: "desc" } } },
    });

    return NextResponse.json({ pickups });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/pickups — Create Pickup Request
export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json();

    const pickup = await PickupService.createPickupRequest(body);
    return NextResponse.json({ pickup }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
