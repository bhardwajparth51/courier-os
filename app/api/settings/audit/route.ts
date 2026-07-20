import { NextRequest, NextResponse } from "next/server";
import { getAuditLogs } from "@/lib/services/settings.service";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const logs = await getAuditLogs({
    entity:   searchParams.get("entity") ?? undefined,
    entityId: searchParams.get("entityId") ?? undefined,
    userId:   searchParams.get("userId") ?? undefined,
    action:   searchParams.get("action") ?? undefined,
    from:     searchParams.get("from") ? new Date(searchParams.get("from")!) : undefined,
    to:       searchParams.get("to")   ? new Date(searchParams.get("to")!)   : undefined,
    limit:    searchParams.get("limit") ? Number(searchParams.get("limit")) : 50,
    page:     searchParams.get("page")  ? Number(searchParams.get("page"))  : 1,
  });
  return NextResponse.json(logs);
}
