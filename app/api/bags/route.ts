import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DispatchService } from "@/lib/services/dispatch.service";

// GET /api/bags — Fetch courier bags
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const bags = await prisma.courierBag.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        bagShipments: true,
        manifest: true,
      },
    });

    return NextResponse.json({ bags });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/bags — Create new courier bag
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const bag = await DispatchService.createCourierBag({
      ...body,
      handledBy: session.user.name || "Operator",
    });

    return NextResponse.json({ bag }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
