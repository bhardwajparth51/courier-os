import { prisma } from "@/lib/prisma";

// ─────────────────────────────────────────────
// ZONES
// ─────────────────────────────────────────────

export async function getZones() {
  return prisma.zone.findMany({
    where: { isActive: true },
    include: { _count: { select: { pincodes: true, rateSlabs: true } } },
    orderBy: { code: "asc" },
  });
}

export async function createZone(data: {
  code: string;
  name: string;
  description?: string;
}) {
  return prisma.zone.create({ data });
}

export async function updateZone(id: string, data: Partial<{ code: string; name: string; description: string; isActive: boolean }>) {
  return prisma.zone.update({ where: { id }, data });
}

export async function deleteZone(id: string) {
  return prisma.zone.update({ where: { id }, data: { isActive: false } });
}

// Zone pincode mapping
export async function getZonePincodes(zoneId: string) {
  return prisma.zonePincode.findMany({ where: { zoneId }, orderBy: { pincode: "asc" } });
}

export async function addPincodesToZone(zoneId: string, pincodes: { pincode: string; city: string; state: string }[]) {
  return prisma.zonePincode.createMany({
    data: pincodes.map((p) => ({ ...p, zoneId })),
    skipDuplicates: true,
  });
}

export async function removePincodeFromZone(id: string) {
  return prisma.zonePincode.delete({ where: { id } });
}

export async function lookupZoneByPincode(pincode: string) {
  const entry = await prisma.zonePincode.findUnique({
    where: { pincode },
    include: { zone: true },
  });
  return entry?.zone ?? null;
}

// ─────────────────────────────────────────────
// BANKS
// ─────────────────────────────────────────────

export async function getBanks() {
  return prisma.bank.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
}

export async function createBank(data: {
  name: string;
  accountNumber?: string;
  ifscCode?: string;
  branchName?: string;
}) {
  return prisma.bank.create({ data });
}

export async function updateBank(id: string, data: Partial<{ name: string; accountNumber: string; ifscCode: string; branchName: string; isActive: boolean }>) {
  return prisma.bank.update({ where: { id }, data });
}

export async function deleteBank(id: string) {
  return prisma.bank.update({ where: { id }, data: { isActive: false } });
}

// ─────────────────────────────────────────────
// VEHICLE TYPES
// ─────────────────────────────────────────────

export async function getVehicleTypes() {
  return prisma.vehicleType.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
}

export async function createVehicleType(data: { name: string; description?: string }) {
  return prisma.vehicleType.create({ data });
}

export async function updateVehicleType(id: string, data: Partial<{ name: string; description: string; isActive: boolean }>) {
  return prisma.vehicleType.update({ where: { id }, data });
}

// ─────────────────────────────────────────────
// PACKAGING TYPES
// ─────────────────────────────────────────────

export async function getPackagingTypes() {
  return prisma.packagingType.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
}

export async function createPackagingType(data: {
  name: string;
  description?: string;
  dimensions?: string;
  maxWeightKg?: number;
  priceAddOn?: number;
}) {
  return prisma.packagingType.create({ data });
}

export async function updatePackagingType(id: string, data: Partial<{ name: string; description: string; dimensions: string; maxWeightKg: number; priceAddOn: number; isActive: boolean }>) {
  return prisma.packagingType.update({ where: { id }, data });
}

// ─────────────────────────────────────────────
// SERVICE TYPE CONFIGS
// ─────────────────────────────────────────────

export async function getServiceTypeConfigs() {
  return prisma.serviceTypeConfig.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
}

export async function upsertServiceTypeConfig(data: {
  code: string;
  name: string;
  description?: string;
  transitDays?: number;
  multiplier?: number;
}) {
  return prisma.serviceTypeConfig.upsert({
    where: { code: data.code },
    update: data,
    create: data,
  });
}

export async function updateServiceTypeConfig(id: string, data: Partial<{ name: string; description: string; transitDays: number; multiplier: number; isActive: boolean }>) {
  return prisma.serviceTypeConfig.update({ where: { id }, data });
}

// ─────────────────────────────────────────────
// EXPENSE CATEGORY CONFIGS
// ─────────────────────────────────────────────

export async function getExpenseCategoryConfigs() {
  return prisma.expenseCategoryConfig.findMany({ orderBy: { name: "asc" } });
}

export async function upsertExpenseCategoryConfig(data: {
  code: string;
  name: string;
  description?: string;
}) {
  return prisma.expenseCategoryConfig.upsert({
    where: { code: data.code },
    update: data,
    create: data,
  });
}

export async function updateExpenseCategoryConfig(id: string, data: Partial<{ name: string; description: string; isActive: boolean }>) {
  return prisma.expenseCategoryConfig.update({ where: { id }, data });
}

// ─────────────────────────────────────────────
// PAYMENT MODE CONFIGS
// ─────────────────────────────────────────────

export async function getPaymentModeConfigs() {
  return prisma.paymentModeConfig.findMany({ orderBy: { name: "asc" } });
}

export async function upsertPaymentModeConfig(data: { code: string; name: string }) {
  return prisma.paymentModeConfig.upsert({
    where: { code: data.code },
    update: data,
    create: data,
  });
}

// ─────────────────────────────────────────────
// SEED DEFAULTS
// (Call once after migration to populate standard values)
// ─────────────────────────────────────────────

export async function seedMasterDataDefaults() {
  // Service types
  const serviceTypes = [
    { code: "EXPRESS",       name: "Express",       transitDays: 1, multiplier: 1.5, description: "Next-day priority delivery" },
    { code: "STANDARD",      name: "Standard",      transitDays: 3, multiplier: 1.0, description: "3–4 day standard delivery" },
    { code: "SURFACE",       name: "Surface",       transitDays: 7, multiplier: 0.7, description: "7–10 day surface freight" },
    { code: "INTERNATIONAL", name: "International", transitDays: 14, multiplier: 3.0, description: "Cross-border international delivery" },
  ];
  for (const s of serviceTypes) await upsertServiceTypeConfig(s);

  // Expense categories
  const expenseCategories = [
    { code: "RENT",          name: "Rent" },
    { code: "FUEL",          name: "Fuel" },
    { code: "ELECTRICITY",   name: "Electricity" },
    { code: "INTERNET",      name: "Internet" },
    { code: "SALARY",        name: "Salary" },
    { code: "COURIER_BAGS",  name: "Courier Bags" },
    { code: "THERMAL_ROLLS", name: "Thermal Rolls" },
    { code: "PRINTER",       name: "Printer Maintenance" },
    { code: "PACKAGING",     name: "Packaging Supplies" },
    { code: "MAINTENANCE",   name: "Maintenance" },
    { code: "MARKETING",     name: "Marketing" },
    { code: "MISC",          name: "Miscellaneous" },
  ];
  for (const e of expenseCategories) await upsertExpenseCategoryConfig(e);

  // Payment modes
  const paymentModes = [
    { code: "CASH", name: "Cash" },
    { code: "UPI",  name: "UPI" },
    { code: "CARD", name: "Card" },
    { code: "COD",  name: "Cash on Delivery" },
  ];
  for (const p of paymentModes) await upsertPaymentModeConfig(p);

  // Default zones (DTDC standard)
  const zones = [
    { code: "A", name: "Metro",    description: "Delhi, Mumbai, Chennai, Kolkata, Bangalore, Hyderabad" },
    { code: "B", name: "Regional", description: "State capitals and major cities" },
    { code: "C", name: "B-class",  description: "District headquarters and large towns" },
    { code: "D", name: "C-class",  description: "Smaller towns and semi-urban areas" },
    { code: "E", name: "Remote",   description: "Rural, ODA, and remote areas" },
  ];
  for (const z of zones) {
    await prisma.zone.upsert({ where: { code: z.code }, update: z, create: z });
  }

  // Default vehicle types
  const vehicles = [
    { name: "Bike",    description: "Two-wheeler for local delivery runs" },
    { name: "Auto",    description: "Three-wheeler for light loads" },
    { name: "Van",     description: "Four-wheeler for medium volume runs" },
    { name: "Tempo",   description: "Light commercial vehicle for large loads" },
  ];
  for (const v of vehicles) {
    await prisma.vehicleType.upsert({ where: { name: v.name }, update: v, create: v });
  }

  // Default packaging types
  const packaging = [
    { name: "Document Envelope", description: "Flat envelope for documents only", maxWeightKg: 0.5,  priceAddOn: 0 },
    { name: "Small Box",         description: "Up to 5 kg small parcels",         maxWeightKg: 5,    priceAddOn: 25 },
    { name: "Medium Box",        description: "Up to 15 kg medium parcels",        maxWeightKg: 15,   priceAddOn: 50 },
    { name: "Large Box",         description: "Up to 30 kg heavy parcels",         maxWeightKg: 30,   priceAddOn: 100 },
    { name: "Fragile Pack",      description: "Cushioned pack for fragile items",  maxWeightKg: 10,   priceAddOn: 75 },
  ];
  for (const p of packaging) {
    await prisma.packagingType.upsert({ where: { name: p.name }, update: p, create: p });
  }

  return { ok: true };
}
