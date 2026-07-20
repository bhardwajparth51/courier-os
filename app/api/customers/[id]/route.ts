import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/customers/[id] — Full profile data graph
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } },
        savedAddresses: true,
        customerNotes: { orderBy: { createdAt: "desc" } },
        communications: { orderBy: { createdAt: "desc" } },
        customerDocuments: { orderBy: { uploadedAt: "desc" } },
        customerTags: true,
        customerRoutes: true,
        shipments: {
          orderBy: { createdAt: "desc" },
          take: 50,
          select: {
            id: true,
            awbNumber: true,
            createdAt: true,
            receiverName: true,
            receiverCity: true,
            weight: true,
            totalAmount: true,
            status: true,
            serviceType: true,
          },
        },
      },
    });

    if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

    return NextResponse.json({ customer });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
