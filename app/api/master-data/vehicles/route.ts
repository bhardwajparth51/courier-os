import { NextRequest, NextResponse } from "next/server";
import {
  getVehicleTypes, createVehicleType, updateVehicleType,
  getPackagingTypes, createPackagingType, updatePackagingType,
} from "@/lib/services/master-data.service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    if (type === "packaging") {
      const items = await getPackagingTypes();
      return NextResponse.json({ packaging: items });
    }

    const vehicles = await getVehicleTypes();
    return NextResponse.json({ vehicles });
  } catch (err: any) {
    console.error("[vehicles GET]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.type === "packaging") {
      const { type, ...data } = body;
      const item = await createPackagingType(data);
      return NextResponse.json({ item });
    }

    const { type, ...data } = body;
    const vehicle = await createVehicleType(data);
    return NextResponse.json({ vehicle });
  } catch (err: any) {
    console.error("[vehicles POST]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, entityType, ...data } = body;

    if (entityType === "packaging") {
      const item = await updatePackagingType(id, data);
      return NextResponse.json({ item });
    }

    const vehicle = await updateVehicleType(id, data);
    return NextResponse.json({ vehicle });
  } catch (err: any) {
    console.error("[vehicles PATCH]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
