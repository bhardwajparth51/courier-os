import { NextRequest, NextResponse } from "next/server";
import {
  getAllPermissions, updatePermission, seedDefaultPermissions,
  getAllUsers, updateUserRole, deactivateUser,
} from "@/lib/services/rbac.service";
import { getSecurityLogs } from "@/lib/services/settings.service";

// GET /api/settings/security?section=users|roles|logs
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const section = searchParams.get("section") ?? "users";

  if (section === "users") {
    const users = await getAllUsers();
    return NextResponse.json({ users });
  }

  if (section === "roles") {
    const permissions = await getAllPermissions();
    return NextResponse.json({ permissions });
  }

  if (section === "logs") {
    const logs = await getSecurityLogs({
      userId: searchParams.get("userId") ?? undefined,
      event:  searchParams.get("event")  ?? undefined,
      limit:  searchParams.get("limit") ? Number(searchParams.get("limit")) : 50,
      page:   searchParams.get("page")  ? Number(searchParams.get("page"))  : 1,
    });
    return NextResponse.json(logs);
  }

  return NextResponse.json({ error: "Unknown section" }, { status: 400 });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();

  if (body.action === "updateRole") {
    const user = await updateUserRole(body.userId, body.role);
    return NextResponse.json({ user });
  }

  if (body.action === "deactivate") {
    await deactivateUser(body.userId);
    return NextResponse.json({ ok: true });
  }

  if (body.action === "updatePermission") {
    const perm = await updatePermission(body.role, body.module, body.perms);
    return NextResponse.json({ perm });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.action === "seedPermissions") {
    const result = await seedDefaultPermissions();
    return NextResponse.json(result);
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
