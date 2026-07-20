import { NextRequest, NextResponse } from "next/server";
import { calculateFreight } from "@/lib/services/rate-engine.service";

// POST /api/rates/calculate
// Body: { originPincode, destPincode, serviceCode, weightGrams,
//         declaredValue?, codAmount?, packagingTypeId?, isODA?, hasInsurance? }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { originPincode, destPincode, serviceCode, weightGrams } = body;

    if (!originPincode || !destPincode || !serviceCode || !weightGrams) {
      return NextResponse.json(
        { error: "originPincode, destPincode, serviceCode, and weightGrams are required" },
        { status: 400 }
      );
    }

    const quote = await calculateFreight({
      originPincode: String(originPincode),
      destPincode: String(destPincode),
      serviceCode: String(serviceCode).toUpperCase(),
      weightGrams: Number(weightGrams),
      declaredValue: body.declaredValue ? Number(body.declaredValue) : 0,
      codAmount: body.codAmount ? Number(body.codAmount) : 0,
      packagingTypeId: body.packagingTypeId ?? undefined,
      isODA: body.isODA === true,
      hasInsurance: body.hasInsurance === true,
    });

    return NextResponse.json({ quote });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
