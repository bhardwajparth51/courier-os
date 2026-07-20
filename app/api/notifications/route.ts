import { NextRequest, NextResponse } from "next/server";
import {
  getInAppNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  archiveNotification,
  createInAppNotification,
} from "@/lib/services/notification.service";
import { NotificationCategory, NotificationPriority, Role } from "@prisma/client";

// GET /api/notifications?category=OPERATIONS&isRead=false
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") as NotificationCategory | undefined;
    const isRead = searchParams.get("isRead") === "true" ? true : searchParams.get("isRead") === "false" ? false : undefined;
    const role = searchParams.get("role") as Role | undefined;

    const data = await getInAppNotifications({
      category: category || undefined,
      isRead,
      role: role || undefined,
      limit: 100,
    });

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("[notifications GET]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/notifications
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.action === "markAllRead") {
      await markAllNotificationsAsRead(body.userId, body.role);
      return NextResponse.json({ ok: true });
    }

    if (body.action === "archive") {
      await archiveNotification(body.id);
      return NextResponse.json({ ok: true });
    }

    // Default: mark single as read
    const notification = await markNotificationAsRead(body.id);
    return NextResponse.json({ notification });
  } catch (err: any) {
    console.error("[notifications PATCH]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/notifications -> Create custom alert
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const notification = await createInAppNotification({
      userId: body.userId,
      role: body.role,
      category: body.category as NotificationCategory,
      priority: body.priority as NotificationPriority,
      title: body.title,
      message: body.message,
      link: body.link,
    });

    return NextResponse.json({ notification });
  } catch (err: any) {
    console.error("[notifications POST]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
