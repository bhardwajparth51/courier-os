import { NextRequest, NextResponse } from "next/server";
import { getSurchargeConfig, updateSurchargeConfig } from "@/lib/services/rate-engine.service";

// GET /api/rates/surcharges → current surcharge config
export async function GET() {
  const config = await getSurchargeConfig();
  return NextResponse.json({ config });
}

// PATCH /api/rates/surcharges → update surcharge config
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const config = await updateSurchargeConfig(body);
  return NextResponse.json({ config });
}
