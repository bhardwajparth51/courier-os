import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ShipmentService } from "@/lib/services/shipment.service";

// GET /api/shipments — Paginated Search & Multi-Filter List
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");
    const serviceType = searchParams.get("serviceType");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "15")));
    const skip = (page - 1) * limit;

    // Role scoping: Customer sees only their own shipments
    let roleWhere: any = {};
    if (session.user.role === "CUSTOMER") {
      const customer = await prisma.customer.findUnique({
        where: { userId: session.user.id },
      });
      if (!customer) {
        return NextResponse.json({ shipments: [], total: 0, pages: 0 });
      }
      roleWhere = { customerId: customer.id };
    }

    // Build multi-search filter
    const searchWhere = search
      ? {
          OR: [
            { awbNumber: { contains: search, mode: "insensitive" as const } },
            { senderName: { contains: search, mode: "insensitive" as const } },
            { senderPhone: { contains: search, mode: "insensitive" as const } },
            { receiverName: { contains: search, mode: "insensitive" as const } },
            { receiverPhone: { contains: search, mode: "insensitive" as const } },
            { receiverCity: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const statusWhere = status && status !== "ALL" ? { status: status as any } : {};
    const serviceWhere = serviceType && serviceType !== "ALL" ? { serviceType: serviceType as any } : {};

    const dateWhere =
      startDate || endDate
        ? {
            createdAt: {
              ...(startDate ? { gte: new Date(startDate) } : {}),
              ...(endDate ? { lte: new Date(endDate) } : {}),
            },
          }
        : {};

    const where = {
      ...roleWhere,
      ...searchWhere,
      ...statusWhere,
      ...serviceWhere,
      ...dateWhere,
    };

    const [shipments, total] = await Promise.all([
      prisma.shipment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          payment: { select: { status: true, method: true } },
          branch: { select: { name: true } },
        },
      }),
      prisma.shipment.count({ where }),
    ]);

    return NextResponse.json({
      shipments,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error("API Error GET /api/shipments:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch shipments" }, { status: 500 });
  }
}

// POST /api/shipments — Create Shipment
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const result = await ShipmentService.createShipment({
      ...body,
      performedBy: session.user.name || session.user.email || "Staff Operator",
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("API Error POST /api/shipments:", error);
    return NextResponse.json({ error: error.message || "Failed to create shipment" }, { status: 400 });
  }
}
