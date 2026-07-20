import { NextRequest, NextResponse } from "next/server";
import {
  getZones, createZone, updateZone, deleteZone,
  addPincodesToZone, getZonePincodes, removePincodeFromZone,
} from "@/lib/services/master-data.service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const zoneId = searchParams.get("zoneId");

    if (zoneId) {
      const pincodes = await getZonePincodes(zoneId);
      return NextResponse.json({ pincodes });
    }

    const zones = await getZones();
    return NextResponse.json({ zones });
  } catch (err: any) {
    console.error("[zones GET]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.action === "addPincodes") {
      const result = await addPincodesToZone(body.zoneId, body.pincodes);
      return NextResponse.json({ count: result.count });
    }

    if (body.action === "removePincode") {
      await removePincodeFromZone(body.id);
      return NextResponse.json({ ok: true });
    }

    const zone = await createZone(body);
    return NextResponse.json({ zone });
  } catch (err: any) {
    console.error("[zones POST]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...data } = body;
    const zone = await updateZone(id, data);
    return NextResponse.json({ zone });
  } catch (err: any) {
    console.error("[zones PATCH]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    await deleteZone(id);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[zones DELETE]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
