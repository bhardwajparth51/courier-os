import { prisma } from "@/lib/prisma";
import { NotificationCategory, NotificationPriority, NotificationChannel, Role } from "@prisma/client";
import { getTemplate } from "./settings.service";

// ─────────────────────────────────────────────
// Adapters & Log helper
// ─────────────────────────────────────────────

interface SendResult {
  ok: boolean;
  provider: string;
  message?: string;
  error?: string;
}

async function writeNotificationLog(
  channel: NotificationChannel,
  recipient: string,
  subject: string | null,
  body: string,
  status: "SUCCESS" | "FAILED",
  provider: string
) {
  try {
    await prisma.notificationLog.create({
      data: { channel, recipient, subject, body, status, provider },
    });
  } catch (e) {
    console.error("[writeNotificationLog Error]", e);
  }
}

async function getSmsProvider(): Promise<string> {
  const row = await prisma.systemSetting.findUnique({ where: { key: "sms_provider" } });
  return row?.value ?? "mock";
}

async function getEmailProvider(): Promise<string> {
  const row = await prisma.systemSetting.findUnique({ where: { key: "smtp_host" } });
  return row?.value ? "smtp" : "mock";
}

function mockSend(channel: NotificationChannel, to: string, body: string, subject?: string): SendResult {
  const ts = new Date().toISOString();
  console.log(`[${ts}] [MOCK ${channel}] → ${to}\n${subject ? `Subject: ${subject}\n` : ""}${body}\n`);
  writeNotificationLog(channel, to, subject ?? null, body, "SUCCESS", "mock");
  return { ok: true, provider: "mock", message: "Logged to console (mock mode)" };
}

async function msg91Send(to: string, body: string): Promise<SendResult> {
  const keyRow = await prisma.systemSetting.findUnique({ where: { key: "sms_api_key" } });
  const apiKey = keyRow?.value;
  if (!apiKey) {
    writeNotificationLog("SMS", to, null, body, "FAILED", "msg91");
    return { ok: false, provider: "msg91", error: "MSG91 API key not configured" };
  }

  try {
    const res = await fetch("https://api.msg91.com/api/v5/flow/", {
      method: "POST",
      headers: { "Content-Type": "application/json", authkey: apiKey },
      body: JSON.stringify({ template_id: "sms", mobiles: to, body }),
    });
    const data = await res.json();
    const ok = data.type === "success";
    writeNotificationLog("SMS", to, null, body, ok ? "SUCCESS" : "FAILED", "msg91");
    return { ok, provider: "msg91", message: data.message };
  } catch (e: any) {
    writeNotificationLog("SMS", to, null, body, "FAILED", "msg91");
    return { ok: false, provider: "msg91", error: e.message };
  }
}

function substituteVariables(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}

// ─────────────────────────────────────────────
// In-App Notification Center
// ─────────────────────────────────────────────

export async function createInAppNotification(params: {
  userId?: string;
  role?: Role;
  category?: NotificationCategory;
  priority?: NotificationPriority;
  title: string;
  message: string;
  link?: string;
}) {
  return prisma.notification.create({
    data: {
      userId: params.userId,
      role: params.role,
      category: params.category ?? NotificationCategory.OPERATIONS,
      priority: params.priority ?? NotificationPriority.MEDIUM,
      title: params.title,
      message: params.message,
      link: params.link,
    },
  });
}

export async function getInAppNotifications(filters: {
  userId?: string;
  role?: Role;
  category?: NotificationCategory;
  isRead?: boolean;
  isArchived?: boolean;
  limit?: number;
}) {
  const { userId, role, category, isRead, isArchived = false, limit = 50 } = filters;

  const where = {
    isArchived,
    ...(isRead !== undefined ? { isRead } : {}),
    ...(category ? { category } : {}),
    OR: [
      ...(userId ? [{ userId }] : []),
      ...(role ? [{ role }] : []),
      { userId: null, role: null }, // broadcast to all
    ],
  };

  try {
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      prisma.notification.count({
        where: { ...where, isRead: false },
      }),
    ]);

    return { notifications, unreadCount };
  } catch (e) {
    console.error("[getInAppNotifications error]", e);
    return { notifications: [], unreadCount: 0 };
  }
}


export async function markNotificationAsRead(id: string) {
  return prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });
}

export async function markAllNotificationsAsRead(userId?: string, role?: Role) {
  return prisma.notification.updateMany({
    where: {
      isRead: false,
      OR: [
        ...(userId ? [{ userId }] : []),
        ...(role ? [{ role }] : []),
        { userId: null, role: null },
      ],
    },
    data: { isRead: true },
  });
}

export async function archiveNotification(id: string) {
  return prisma.notification.update({
    where: { id },
    data: { isArchived: true },
  });
}

// ─────────────────────────────────────────────
// Outbound Channels (SMS / WhatsApp / Email)
// ─────────────────────────────────────────────

export async function sendSMS(
  phone: string,
  templateName: string,
  variables: Record<string, string>
): Promise<SendResult> {
  const template = await getTemplate(templateName, "SMS");
  if (!template) return { ok: false, provider: "none", error: `SMS template "${templateName}" not found or disabled` };

  const body = substituteVariables(template.body, variables);
  const provider = await getSmsProvider();

  if (provider === "msg91") return msg91Send(phone, body);
  return mockSend("SMS", phone, body);
}

async function metaWhatsAppSend(phone: string, templateName: string, body: string): Promise<SendResult> {
  try {
    const settings = await prisma.systemSetting.findMany({
      where: { key: { in: ["whatsapp_phone_number_id", "whatsapp_access_token"] } },
    });
    const cfg = Object.fromEntries(settings.map((s) => [s.key, s.value]));
    if (!cfg.whatsapp_phone_number_id || !cfg.whatsapp_access_token) {
      writeNotificationLog("WHATSAPP", phone, null, body, "FAILED", "meta");
      return { ok: false, provider: "meta", error: "WhatsApp Phone Number ID or Token missing" };
    }

    const cleanPhone = phone.replace(/\D/g, "");
    const recipient = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    const res = await fetch(`https://graph.facebook.com/v18.0/${cfg.whatsapp_phone_number_id}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${cfg.whatsapp_access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: recipient,
        type: "text",
        text: { body },
      }),
    });
    const data = await res.json();
    const ok = res.ok && data.messages?.[0]?.id;
    writeNotificationLog("WHATSAPP", phone, null, body, ok ? "SUCCESS" : "FAILED", "meta");
    return { ok, provider: "meta", message: ok ? "Dispatched via Meta Cloud API" : data.error?.message };
  } catch (e: any) {
    writeNotificationLog("WHATSAPP", phone, null, body, "FAILED", "meta");
    return { ok: false, provider: "meta", error: e.message };
  }
}

export async function sendWhatsApp(
  phone: string,
  templateName: string,
  variables: Record<string, string>
): Promise<SendResult> {
  const template = await getTemplate(templateName, "WHATSAPP");
  if (!template) return { ok: false, provider: "none", error: `WhatsApp template "${templateName}" not found or disabled` };

  const body = substituteVariables(template.body, variables);

  const providerRow = await prisma.systemSetting.findUnique({ where: { key: "whatsapp_provider" } });
  const provider = providerRow?.value ?? "mock";

  if (provider === "meta") {
    return metaWhatsAppSend(phone, templateName, body);
  }

  return mockSend("WHATSAPP", phone, body);
}


export async function sendEmail(
  to: string,
  templateName: string,
  variables: Record<string, string>
): Promise<SendResult> {
  const template = await getTemplate(templateName, "EMAIL");
  if (!template) return { ok: false, provider: "none", error: `Email template "${templateName}" not found or disabled` };

  const body = substituteVariables(template.body, variables);
  const subject = template.subject ? substituteVariables(template.subject, variables) : "CourierOS Notification";
  const provider = await getEmailProvider();

  if (provider === "smtp") {
    return sendViaSMTP(to, subject, body);
  }

  return mockSend("EMAIL", to, body, subject);
}

async function sendViaSMTP(to: string, subject: string, body: string): Promise<SendResult> {
  try {
    const settings = await prisma.systemSetting.findMany({
      where: { key: { in: ["smtp_host", "smtp_port", "smtp_user", "smtp_pass", "smtp_from"] } },
    });
    const cfg = Object.fromEntries(settings.map((s) => [s.key, s.value]));

    if (!cfg.smtp_host) {
      return mockSend("EMAIL", to, body, subject);
    }

    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.createTransport({
      host: cfg.smtp_host,
      port: Number(cfg.smtp_port ?? 587),
      secure: Number(cfg.smtp_port) === 465,
      auth: { user: cfg.smtp_user, pass: cfg.smtp_pass },
    });

    await transporter.sendMail({
      from: cfg.smtp_from || cfg.smtp_user,
      to, subject, text: body,
    });

    writeNotificationLog("EMAIL", to, subject, body, "SUCCESS", "smtp");
    return { ok: true, provider: "smtp" };
  } catch (e: any) {
    writeNotificationLog("EMAIL", to, subject, body, "FAILED", "smtp");
    return { ok: false, provider: "smtp", error: e.message };
  }
}

// ─────────────────────────────────────────────
// Customer Preferences Helper
// ─────────────────────────────────────────────

export async function getCustomerPreferences(userId: string) {
  let pref = await prisma.notificationPreference.findUnique({ where: { userId } });
  if (!pref) {
    pref = await prisma.notificationPreference.create({
      data: { userId },
    });
  }
  return pref;
}

export async function updateCustomerPreferences(userId: string, data: Partial<{
  bookingUpdates: boolean;
  pickupUpdates: boolean;
  deliveryUpdates: boolean;
  promotions: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  whatsappEnabled: boolean;
}>) {
  return prisma.notificationPreference.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
  });
}

// ─────────────────────────────────────────────
// Domain Event Dispatchers & Trigger Functions
// ─────────────────────────────────────────────

export async function triggerOwnerAlert(params: {
  title: string;
  message: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  link?: string;
}) {
  return createInAppNotification({
    role: Role.OWNER,
    category: params.category,
    priority: params.priority,
    title: params.title,
    message: params.message,
    link: params.link,
  });
}

export async function triggerEmployeeAlert(params: {
  userId?: string;
  role?: Role;
  category: NotificationCategory;
  title: string;
  message: string;
  link?: string;
}) {
  return createInAppNotification({
    userId: params.userId,
    role: params.role ?? Role.EMPLOYEE,
    category: params.category,
    priority: NotificationPriority.MEDIUM,
    title: params.title,
    message: params.message,
    link: params.link,
  });
}

// Event Triggers
export async function notifyShipmentBooked(data: {
  phone: string;
  email?: string;
  awb: string;
  sender: string;
  receiver: string;
  amount: string;
}) {
  const vars = { ...data, trackUrl: `https://www.dtdc.in/tracking?awb=${data.awb}` };
  await Promise.allSettled([
    sendSMS(data.phone, "shipment_booked", vars),
    sendWhatsApp(data.phone, "shipment_booked_whatsapp", vars),
    ...(data.email ? [sendEmail(data.email, "invoice", { name: data.sender, invoiceNumber: `INV-${data.awb}`, amount: data.amount })] : []),
    createInAppNotification({
      category: NotificationCategory.OPERATIONS,
      priority: NotificationPriority.LOW,
      title: "New Booking Created",
      message: `Shipment ${data.awb} booked for ${data.receiver} (₹${data.amount})`,
      link: `/owner/shipments?search=${data.awb}`,
    }),
  ]);
}

export async function notifyPickupScheduled(data: {
  phone: string;
  awb: string;
  date: string;
  timeSlot: string;
  pickupNumber: string;
}) {
  await Promise.allSettled([
    sendSMS(data.phone, "pickup_scheduled", data),
    createInAppNotification({
      role: Role.EMPLOYEE,
      category: NotificationCategory.OPERATIONS,
      priority: NotificationPriority.MEDIUM,
      title: "New Pickup Request",
      message: `Pickup #${data.pickupNumber} scheduled for ${data.date} (${data.timeSlot})`,
      link: `/employee/pickup`,
    }),
  ]);
}

export async function notifyOutForDelivery(data: {
  phone: string;
  awb: string;
  driverPhone: string;
}) {
  await Promise.allSettled([
    sendSMS(data.phone, "out_for_delivery", data),
    createInAppNotification({
      category: NotificationCategory.OPERATIONS,
      priority: NotificationPriority.LOW,
      title: "Out for Delivery",
      message: `Shipment ${data.awb} is out for delivery.`,
    }),
  ]);
}

export async function notifyDelivered(data: {
  phone: string;
  email?: string;
  awb: string;
  receiver: string;
  date: string;
}) {
  await Promise.allSettled([
    sendSMS(data.phone, "delivered", data),
    sendWhatsApp(data.phone, "delivered_whatsapp", data),
    ...(data.email ? [sendEmail(data.email, "delivered", data)] : []),
    createInAppNotification({
      category: NotificationCategory.OPERATIONS,
      priority: NotificationPriority.LOW,
      title: "Shipment Delivered",
      message: `AWB ${data.awb} delivered to ${data.receiver}`,
    }),
  ]);
}

export async function notifyCODCollected(data: {
  phone: string;
  awb: string;
  amount: string;
}) {
  await Promise.allSettled([
    sendSMS(data.phone, "cod_collected", data),
    createInAppNotification({
      category: NotificationCategory.FINANCE,
      priority: NotificationPriority.MEDIUM,
      title: "COD Collected",
      message: `COD amount ₹${data.amount} collected for AWB ${data.awb}`,
      link: `/owner/finance`,
    }),
  ]);
}
