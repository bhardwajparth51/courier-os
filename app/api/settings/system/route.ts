import { NextRequest, NextResponse } from "next/server";
import { getAllSettings, setManySettings, seedDefaultSettings } from "@/lib/services/settings.service";

export async function GET() {
  const settings = await getAllSettings();
  return NextResponse.json({ settings });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  await setManySettings(body);
  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.action === "seed") {
    const result = await seedDefaultSettings();
    return NextResponse.json(result);
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
