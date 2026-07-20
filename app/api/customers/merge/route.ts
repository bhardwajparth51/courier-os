import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { CustomerService } from "@/lib/services/customer.service";

// POST /api/customers/merge — Merge duplicate accounts
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { primaryCustomerId, secondaryCustomerId } = await req.json();
    if (!primaryCustomerId || !secondaryCustomerId) {
      return NextResponse.json({ error: "Primary and Secondary customer IDs required" }, { status: 400 });
    }

    const result = await CustomerService.mergeCustomers(primaryCustomerId, secondaryCustomerId);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
