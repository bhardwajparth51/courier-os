import { prisma } from "@/lib/prisma";

// ─────────────────────────────────────────────
// SYSTEM SETTINGS (key-value store)
// ─────────────────────────────────────────────

export async function getSetting(key: string): Promise<string | null> {
  const row = await prisma.systemSetting.findUnique({ where: { key } });
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await prisma.systemSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

export async function getSettings(keys: string[]): Promise<Record<string, string>> {
  const rows = await prisma.systemSetting.findMany({ where: { key: { in: keys } } });
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const rows = await prisma.systemSetting.findMany({ orderBy: { key: "asc" } });
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export async function setManySettings(updates: Record<string, string>): Promise<void> {
  await Promise.all(
    Object.entries(updates).map(([key, value]) => setSetting(key, value))
  );
}

// ─────────────────────────────────────────────
// NOTIFICATION TEMPLATES
// ─────────────────────────────────────────────

export async function getNotificationTemplates() {
  return prisma.notificationTemplate.findMany({ orderBy: [{ channel: "asc" }, { name: "asc" }] });
}

export async function getTemplate(name: string, channel?: string) {
  return prisma.notificationTemplate.findFirst({
    where: {
      name,
      ...(channel ? { channel: channel as any } : {}),
      enabled: true,
    },
  });
}

export async function upsertNotificationTemplate(data: {
  name: string;
  channel: "SMS" | "WHATSAPP" | "EMAIL";
  body: string;
  subject?: string;
  variables?: string[];
}) {
  const key = { name: data.name };
  const payload = {
    ...data,
    variables: data.variables ? JSON.stringify(data.variables) : undefined,
  };
  return prisma.notificationTemplate.upsert({
    where: key,
    update: payload,
    create: { ...payload, enabled: true },
  });
}

export async function updateNotificationTemplate(
  id: string,
  data: Partial<{ body: string; subject: string; enabled: boolean; variables: string[] }>
) {
  return prisma.notificationTemplate.update({
    where: { id },
    data: {
      ...data,
      variables: data.variables ? JSON.stringify(data.variables) : undefined,
    },
  });
}

export async function deleteNotificationTemplate(id: string) {
  return prisma.notificationTemplate.delete({ where: { id } });
}

// ─────────────────────────────────────────────
// AUDIT LOG
// ─────────────────────────────────────────────

export interface AuditEntry {
  userId?: string;
  userEmail?: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  entity: string;
  entityId: string;
  oldValue?: object | null;
  newValue?: object | null;
  ipAddress?: string;
  userAgent?: string;
}

export async function writeAuditLog(entry: AuditEntry) {
  return prisma.auditLog.create({
    data: {
      ...entry,
      oldValue: entry.oldValue ? JSON.stringify(entry.oldValue) : undefined,
      newValue: entry.newValue ? JSON.stringify(entry.newValue) : undefined,
    },
  });
}

export async function getAuditLogs(filters: {
  entity?: string;
  entityId?: string;
  userId?: string;
  action?: string;
  from?: Date;
  to?: Date;
  limit?: number;
  page?: number;
}) {
  const { entity, entityId, userId, action, from, to, limit = 50, page = 1 } = filters;

  const where = {
    ...(entity ? { entity } : {}),
    ...(entityId ? { entityId } : {}),
    ...(userId ? { userId } : {}),
    ...(action ? { action } : {}),
    ...(from || to ? { createdAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}),
  };

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: (page - 1) * limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { logs, total, page, pages: Math.ceil(total / limit) };
}

// ─────────────────────────────────────────────
// SECURITY LOG
// ─────────────────────────────────────────────

export async function writeSecurityLog(entry: {
  userId?: string;
  userEmail?: string;
  event: "LOGIN" | "FAILED_LOGIN" | "LOGOUT" | "PASSWORD_CHANGED" | "ROLE_CHANGED" | "USER_CREATED" | "USER_DISABLED" | "TWO_FA_ENABLED";
  ipAddress?: string;
  userAgent?: string;
  metadata?: object;
}) {
  return prisma.securityLog.create({
    data: {
      ...entry,
      metadata: entry.metadata ? JSON.stringify(entry.metadata) : undefined,
    },
  });
}

export async function getSecurityLogs(filters: {
  userId?: string;
  event?: string;
  from?: Date;
  limit?: number;
  page?: number;
}) {
  const { userId, event, from, limit = 50, page = 1 } = filters;

  const where = {
    ...(userId ? { userId } : {}),
    ...(event ? { event: event as any } : {}),
    ...(from ? { createdAt: { gte: from } } : {}),
  };

  const [logs, total] = await Promise.all([
    prisma.securityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: (page - 1) * limit,
    }),
    prisma.securityLog.count({ where }),
  ]);

  return { logs, total, pages: Math.ceil(total / limit) };
}

// ─────────────────────────────────────────────
// SEED DEFAULT SETTINGS
// ─────────────────────────────────────────────

export async function seedDefaultSettings() {
  const defaults: Record<string, string> = {
    invoice_prefix:       "INV",
    awb_prefix:           "AWB",
    timezone:             "Asia/Kolkata",
    currency:             "INR",
    language:             "en-IN",
    date_format:          "DD/MM/YYYY",
    thermal_printer_width: "76",       // mm
    smtp_host:            "",
    smtp_port:            "587",
    smtp_user:            "",
    smtp_from:            "",
    sms_provider:         "mock",      // "mock" | "msg91" | "twilio"
    sms_api_key:          "",
    whatsapp_provider:    "mock",
    whatsapp_token:       "",
  };

  await setManySettings(defaults);

  // Seed default notification templates
  const templates = [
    {
      name: "shipment_booked",
      channel: "SMS" as const,
      body: "Your shipment {{awb}} has been booked. Track at: {{trackUrl}}. - CourierOS DTDC",
      variables: ["awb", "trackUrl", "sender", "receiver"],
    },
    {
      name: "pickup_scheduled",
      channel: "SMS" as const,
      body: "Pickup scheduled for {{date}} between {{timeSlot}}. AWB: {{awb}}. - DTDC",
      variables: ["awb", "date", "timeSlot"],
    },
    {
      name: "out_for_delivery",
      channel: "SMS" as const,
      body: "Your shipment {{awb}} is out for delivery. Driver: {{driverPhone}}. - DTDC",
      variables: ["awb", "driverPhone"],
    },
    {
      name: "delivered",
      channel: "SMS" as const,
      body: "Shipment {{awb}} delivered to {{receiver}} on {{date}}. Thank you! - DTDC",
      variables: ["awb", "receiver", "date"],
    },
    {
      name: "cod_collected",
      channel: "SMS" as const,
      body: "COD amount ₹{{amount}} collected for AWB {{awb}}. - DTDC",
      variables: ["awb", "amount"],
    },
    {
      name: "invoice",
      channel: "EMAIL" as const,
      subject: "Invoice {{invoiceNumber}} — DTDC Courier",
      body: "Dear {{name}},\n\nPlease find your invoice {{invoiceNumber}} for ₹{{amount}} attached.\n\nThank you for choosing DTDC.\n\nRegards,\nCourierOS Team",
      variables: ["name", "invoiceNumber", "amount"],
    },
    {
      name: "shipment_booked_whatsapp",
      channel: "WHATSAPP" as const,
      body: "✅ *Shipment Booked*\nAWB: *{{awb}}*\nFrom: {{sender}}\nTo: {{receiver}}\nAmount: ₹{{amount}}\n\nTrack: {{trackUrl}}",
      variables: ["awb", "sender", "receiver", "amount", "trackUrl"],
    },
    {
      name: "delivered_whatsapp",
      channel: "WHATSAPP" as const,
      body: "📦 *Delivered!*\nAWB: *{{awb}}* delivered to {{receiver}} on {{date}}.\n\nThank you for choosing DTDC!",
      variables: ["awb", "receiver", "date"],
    },
  ];

  for (const t of templates) {
    await upsertNotificationTemplate(t);
  }

  return { ok: true };
}
