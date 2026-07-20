import { NextRequest, NextResponse } from "next/server";
import {
  getNotificationTemplates, upsertNotificationTemplate,
  updateNotificationTemplate, deleteNotificationTemplate,
} from "@/lib/services/settings.service";

export async function GET() {
  const templates = await getNotificationTemplates();
  return NextResponse.json({ templates });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const template = await upsertNotificationTemplate(body);
  return NextResponse.json({ template });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, ...data } = body;
  const template = await updateNotificationTemplate(id, data);
  return NextResponse.json({ template });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await deleteNotificationTemplate(id);
  return NextResponse.json({ ok: true });
}
