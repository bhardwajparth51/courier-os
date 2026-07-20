import { NextResponse } from "next/server";
import { CustomerService } from "@/lib/services/customer.service";

// GET /api/customers/lookup?phone=9876543210 — Compact CRM Booking Preview
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");
    if (!phone) return NextResponse.json({ error: "Phone number required" }, { status: 400 });

    const customer = await CustomerService.lookupByPhone(phone);
    return NextResponse.json({ found: !!customer, customer });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
