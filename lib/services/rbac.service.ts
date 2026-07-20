import { prisma } from "@/lib/prisma";

// ─────────────────────────────────────────────
// Permission defaults per role
// ─────────────────────────────────────────────

const MODULES = [
  "bookings", "customers", "finance", "reports",
  "dispatch", "settings", "rates", "master-data",
  "employees", "audit",
];

const DEFAULT_PERMISSIONS: Record<string, Record<string, { canRead: boolean; canWrite: boolean; canDelete: boolean }>> = {
  OWNER: Object.fromEntries(MODULES.map(m => [m, { canRead: true, canWrite: true, canDelete: true }])),

  MANAGER: {
    bookings:     { canRead: true,  canWrite: true,  canDelete: false },
    customers:    { canRead: true,  canWrite: true,  canDelete: false },
    finance:      { canRead: true,  canWrite: true,  canDelete: false },
    reports:      { canRead: true,  canWrite: false, canDelete: false },
    dispatch:     { canRead: true,  canWrite: true,  canDelete: false },
    settings:     { canRead: true,  canWrite: false, canDelete: false },
    rates:        { canRead: true,  canWrite: false, canDelete: false },
    "master-data":{ canRead: true,  canWrite: false, canDelete: false },
    employees:    { canRead: true,  canWrite: true,  canDelete: false },
    audit:        { canRead: true,  canWrite: false, canDelete: false },
  },

  COUNTER_STAFF: {
    bookings:     { canRead: true,  canWrite: true,  canDelete: false },
    customers:    { canRead: true,  canWrite: true,  canDelete: false },
    finance:      { canRead: false, canWrite: false, canDelete: false },
    reports:      { canRead: false, canWrite: false, canDelete: false },
    dispatch:     { canRead: true,  canWrite: false, canDelete: false },
    settings:     { canRead: false, canWrite: false, canDelete: false },
    rates:        { canRead: true,  canWrite: false, canDelete: false },
    "master-data":{ canRead: true,  canWrite: false, canDelete: false },
    employees:    { canRead: false, canWrite: false, canDelete: false },
    audit:        { canRead: false, canWrite: false, canDelete: false },
  },

  DELIVERY_STAFF: {
    bookings:     { canRead: true,  canWrite: false, canDelete: false },
    customers:    { canRead: false, canWrite: false, canDelete: false },
    finance:      { canRead: false, canWrite: false, canDelete: false },
    reports:      { canRead: false, canWrite: false, canDelete: false },
    dispatch:     { canRead: true,  canWrite: true,  canDelete: false },
    settings:     { canRead: false, canWrite: false, canDelete: false },
    rates:        { canRead: false, canWrite: false, canDelete: false },
    "master-data":{ canRead: false, canWrite: false, canDelete: false },
    employees:    { canRead: false, canWrite: false, canDelete: false },
    audit:        { canRead: false, canWrite: false, canDelete: false },
  },

  ACCOUNTS: {
    bookings:     { canRead: true,  canWrite: false, canDelete: false },
    customers:    { canRead: true,  canWrite: false, canDelete: false },
    finance:      { canRead: true,  canWrite: true,  canDelete: false },
    reports:      { canRead: true,  canWrite: false, canDelete: false },
    dispatch:     { canRead: false, canWrite: false, canDelete: false },
    settings:     { canRead: false, canWrite: false, canDelete: false },
    rates:        { canRead: true,  canWrite: false, canDelete: false },
    "master-data":{ canRead: true,  canWrite: false, canDelete: false },
    employees:    { canRead: false, canWrite: false, canDelete: false },
    audit:        { canRead: true,  canWrite: false, canDelete: false },
  },

  READ_ONLY: Object.fromEntries(MODULES.map(m => [m, { canRead: true, canWrite: false, canDelete: false }])),

  // Legacy
  EMPLOYEE: {
    bookings:     { canRead: true,  canWrite: true,  canDelete: false },
    customers:    { canRead: true,  canWrite: true,  canDelete: false },
    finance:      { canRead: false, canWrite: false, canDelete: false },
    reports:      { canRead: false, canWrite: false, canDelete: false },
    dispatch:     { canRead: true,  canWrite: true,  canDelete: false },
    settings:     { canRead: false, canWrite: false, canDelete: false },
    rates:        { canRead: true,  canWrite: false, canDelete: false },
    "master-data":{ canRead: true,  canWrite: false, canDelete: false },
    employees:    { canRead: false, canWrite: false, canDelete: false },
    audit:        { canRead: false, canWrite: false, canDelete: false },
  },
};

// ─────────────────────────────────────────────
// Seed default permissions
// ─────────────────────────────────────────────

export async function seedDefaultPermissions() {
  for (const [role, modules] of Object.entries(DEFAULT_PERMISSIONS)) {
    for (const [module, perms] of Object.entries(modules)) {
      await prisma.permission.upsert({
        where: { role_module: { role: role as any, module } },
        update: perms,
        create: { role: role as any, module, ...perms },
      });
    }
  }
  return { ok: true };
}

// ─────────────────────────────────────────────
// Permission check helpers
// ─────────────────────────────────────────────

export async function getPermissionsForRole(role: string) {
  const perms = await prisma.permission.findMany({ where: { role: role as any } });
  return Object.fromEntries(perms.map((p) => [p.module, { canRead: p.canRead, canWrite: p.canWrite, canDelete: p.canDelete }]));
}

export async function checkPermission(
  role: string,
  module: string,
  action: "read" | "write" | "delete"
): Promise<boolean> {
  if (role === "OWNER") return true; // Owner always has full access

  const perm = await prisma.permission.findUnique({
    where: { role_module: { role: role as any, module } },
  });

  if (!perm) return false;

  if (action === "read")   return perm.canRead;
  if (action === "write")  return perm.canWrite;
  if (action === "delete") return perm.canDelete;
  return false;
}

export async function updatePermission(
  role: string,
  module: string,
  perms: { canRead?: boolean; canWrite?: boolean; canDelete?: boolean }
) {
  return prisma.permission.upsert({
    where: { role_module: { role: role as any, module } },
    update: perms,
    create: { role: role as any, module, canRead: false, canWrite: false, canDelete: false, ...perms },
  });
}

export async function getAllPermissions() {
  return prisma.permission.findMany({ orderBy: [{ role: "asc" }, { module: "asc" }] });
}

// ─────────────────────────────────────────────
// User management
// ─────────────────────────────────────────────

export async function getAllUsers() {
  return prisma.user.findMany({
    select: {
      id: true, name: true, email: true, role: true,
      createdAt: true, phone: true,
      employee: { select: { staffId: true, designation: true, isActive: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateUserRole(userId: string, role: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { role: role as any },
  });
}

export async function deactivateUser(userId: string) {
  // Soft-deactivate via employee record if present
  await prisma.employee.updateMany({
    where: { userId },
    data: { isActive: false },
  });
}
