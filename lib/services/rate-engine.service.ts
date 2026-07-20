import { prisma } from "@/lib/prisma";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface FreightQuote {
  originZone: string | null;
  destZone: string | null;
  serviceCode: string;
  weightGrams: number;
  baseFreight: number;
  fuelSurcharge: number;
  packagingAddOn: number;
  odaCharge: number;
  codCharge: number;
  insuranceCharge: number;
  subtotal: number;
  gst: number;
  total: number;
  breakdown: Record<string, number>;
}

// ─────────────────────────────────────────────
// Surcharge Config helpers
// ─────────────────────────────────────────────

async function getSurcharge() {
  let config = await prisma.surchargeConfig.findFirst();
  if (!config) {
    // Create default surcharge config if none exists
    config = await prisma.surchargeConfig.create({
      data: {
        fuelSurchargePct: 0,
        odaChargeFlat: 0,
        codChargePct: 1.0,
        codChargeMin: 30,
        insurancePct: 0.5,
        insuranceMin: 50,
        gstPct: 18,
      },
    });
  }
  return config;
}

export async function getSurchargeConfig() {
  return getSurcharge();
}

export async function updateSurchargeConfig(data: Partial<{
  fuelSurchargePct: number;
  odaChargeFlat: number;
  codChargePct: number;
  codChargeMin: number;
  insurancePct: number;
  insuranceMin: number;
  gstPct: number;
}>) {
  const existing = await getSurcharge();
  return prisma.surchargeConfig.update({ where: { id: existing.id }, data });
}

// ─────────────────────────────────────────────
// Rate Card management
// ─────────────────────────────────────────────

export async function getRateCards() {
  return prisma.rateCard.findMany({
    include: { _count: { select: { slabs: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getActiveRateCard() {
  return prisma.rateCard.findFirst({
    where: { isActive: true },
    include: { slabs: { include: { zone: true } } },
  });
}

export async function createRateCard(data: { name: string; description?: string; effectiveFrom?: Date }) {
  return prisma.rateCard.create({ data });
}

export async function activateRateCard(id: string) {
  // Deactivate all first, then activate the selected one
  await prisma.rateCard.updateMany({ data: { isActive: false } });
  return prisma.rateCard.update({ where: { id }, data: { isActive: true } });
}

export async function deleteRateCard(id: string) {
  return prisma.rateCard.delete({ where: { id } });
}

// ─────────────────────────────────────────────
// Rate Slabs
// ─────────────────────────────────────────────

export async function getSlabsByCard(rateCardId: string) {
  return prisma.rateSlab.findMany({
    where: { rateCardId },
    include: { zone: true },
    orderBy: [{ zone: { code: "asc" } }, { serviceCode: "asc" }, { minWeightGrams: "asc" }],
  });
}

export async function upsertSlab(data: {
  rateCardId: string;
  zoneId: string;
  serviceCode: string;
  minWeightGrams: number;
  maxWeightGrams: number;
  baseRate: number;
  additionalRate?: number;
}) {
  // Check for existing slab with same rateCardId + zoneId + serviceCode + minWeight
  const existing = await prisma.rateSlab.findFirst({
    where: {
      rateCardId: data.rateCardId,
      zoneId: data.zoneId,
      serviceCode: data.serviceCode,
      minWeightGrams: data.minWeightGrams,
    },
  });

  if (existing) {
    return prisma.rateSlab.update({
      where: { id: existing.id },
      data: { baseRate: data.baseRate, additionalRate: data.additionalRate ?? 0, maxWeightGrams: data.maxWeightGrams },
    });
  }

  return prisma.rateSlab.create({ data: { ...data, additionalRate: data.additionalRate ?? 0 } });
}

export async function deleteSlab(id: string) {
  return prisma.rateSlab.delete({ where: { id } });
}

// ─────────────────────────────────────────────
// RATE ENGINE — core calculation
// ─────────────────────────────────────────────

/**
 * Looks up which zone a pincode belongs to.
 */
async function resolveZone(pincode: string) {
  const entry = await prisma.zonePincode.findUnique({
    where: { pincode },
    include: { zone: true },
  });
  return entry?.zone ?? null;
}

/**
 * Finds the applicable rate slab for a given zone + service + weight.
 * Falls back to the heaviest slab if weight exceeds all slabs.
 */
async function findSlab(rateCardId: string, zoneId: string, serviceCode: string, weightGrams: number) {
  // Try exact range match
  const slab = await prisma.rateSlab.findFirst({
    where: {
      rateCardId,
      zoneId,
      serviceCode,
      minWeightGrams: { lte: weightGrams },
      maxWeightGrams: { gte: weightGrams },
    },
    orderBy: { minWeightGrams: "asc" },
  });

  if (slab) return { slab, overflow: 0 };

  // Weight exceeds all slabs — use the highest slab + additionalRate for overflow
  const heaviest = await prisma.rateSlab.findFirst({
    where: { rateCardId, zoneId, serviceCode },
    orderBy: { maxWeightGrams: "desc" },
  });

  if (!heaviest) return null;

  const overflow = Math.max(0, weightGrams - heaviest.maxWeightGrams);
  return { slab: heaviest, overflow };
}

/**
 * Primary calculation function.
 * All amounts in ₹, weight in grams.
 */
export async function calculateFreight(params: {
  originPincode: string;
  destPincode: string;
  serviceCode: string;       // "EXPRESS" | "STANDARD" | "SURFACE" | "INTERNATIONAL"
  weightGrams: number;
  declaredValue?: number;
  codAmount?: number;
  packagingTypeId?: string;
  isODA?: boolean;
  hasInsurance?: boolean;
}): Promise<FreightQuote> {
  const {
    originPincode, destPincode, serviceCode,
    weightGrams, declaredValue = 0, codAmount = 0,
    packagingTypeId, isODA = false, hasInsurance = false,
  } = params;

  const [originZone, destZone, surcharge, rateCard] = await Promise.all([
    resolveZone(originPincode),
    resolveZone(destPincode),
    getSurcharge(),
    getActiveRateCard(),
  ]);

  // ── Base freight ──────────────────────────
  let baseFreight = 0;
  if (rateCard && destZone) {
    const result = await findSlab(rateCard.id, destZone.id, serviceCode, weightGrams);
    if (result) {
      const { slab, overflow } = result;
      const extraSlabs = overflow > 0 ? Math.ceil(overflow / 500) : 0;
      baseFreight = slab.baseRate + extraSlabs * (slab.additionalRate ?? 0);
    }
  }

  // Apply service type multiplier from config
  const serviceConfig = await prisma.serviceTypeConfig.findUnique({ where: { code: serviceCode } });
  if (serviceConfig && serviceConfig.multiplier !== 1.0) {
    baseFreight = baseFreight * serviceConfig.multiplier;
  }

  // ── Packaging add-on ──────────────────────
  let packagingAddOn = 0;
  if (packagingTypeId) {
    const pkg = await prisma.packagingType.findUnique({ where: { id: packagingTypeId } });
    packagingAddOn = pkg?.priceAddOn ?? 0;
  }

  // ── Fuel surcharge ────────────────────────
  const fuelSurcharge = baseFreight * (surcharge.fuelSurchargePct / 100);

  // ── ODA charge ────────────────────────────
  const odaCharge = isODA ? surcharge.odaChargeFlat : 0;

  // ── COD charge ────────────────────────────
  let codCharge = 0;
  if (codAmount > 0) {
    codCharge = Math.max(
      surcharge.codChargeMin,
      codAmount * (surcharge.codChargePct / 100)
    );
  }

  // ── Insurance ─────────────────────────────
  let insuranceCharge = 0;
  if (hasInsurance && declaredValue > 0) {
    insuranceCharge = Math.max(
      surcharge.insuranceMin,
      declaredValue * (surcharge.insurancePct / 100)
    );
  }

  const subtotal = baseFreight + fuelSurcharge + packagingAddOn + odaCharge + codCharge + insuranceCharge;
  const gst = subtotal * (surcharge.gstPct / 100);
  const total = subtotal + gst;

  return {
    originZone: originZone?.code ?? null,
    destZone: destZone?.code ?? null,
    serviceCode,
    weightGrams,
    baseFreight: Math.round(baseFreight * 100) / 100,
    fuelSurcharge: Math.round(fuelSurcharge * 100) / 100,
    packagingAddOn,
    odaCharge,
    codCharge: Math.round(codCharge * 100) / 100,
    insuranceCharge: Math.round(insuranceCharge * 100) / 100,
    subtotal: Math.round(subtotal * 100) / 100,
    gst: Math.round(gst * 100) / 100,
    total: Math.round(total * 100) / 100,
    breakdown: {
      "Base Freight":    Math.round(baseFreight * 100) / 100,
      "Packaging":       packagingAddOn,
      "Fuel Surcharge":  Math.round(fuelSurcharge * 100) / 100,
      "ODA Charge":      odaCharge,
      "COD Charge":      Math.round(codCharge * 100) / 100,
      "Insurance":       Math.round(insuranceCharge * 100) / 100,
      [`GST (${surcharge.gstPct}%)`]: Math.round(gst * 100) / 100,
    },
  };
}

// ─────────────────────────────────────────────
// Seed a standard DTDC rate card
// ─────────────────────────────────────────────

export async function seedDefaultRateCard() {
  // Check if one already exists
  const existing = await prisma.rateCard.findFirst({ where: { name: "DTDC Standard 2026" } });
  if (existing) return { ok: true, rateCard: existing, message: "Already exists" };

  const zones = await prisma.zone.findMany({ orderBy: { code: "asc" } });
  if (zones.length === 0) return { ok: false, message: "Seed master data (zones) first" };

  const rateCard = await prisma.rateCard.create({
    data: { name: "DTDC Standard 2026", description: "Default rate card for all zones", isActive: true },
  });

  // Standard DTDC-style rates (₹) per zone per service for first 500g
  // [zone code]: { STANDARD, EXPRESS, SURFACE }
  const baseRates: Record<string, Record<string, number>> = {
    A: { STANDARD: 45,  EXPRESS: 80,  SURFACE: 30  },
    B: { STANDARD: 60,  EXPRESS: 100, SURFACE: 40  },
    C: { STANDARD: 80,  EXPRESS: 130, SURFACE: 55  },
    D: { STANDARD: 100, EXPRESS: 160, SURFACE: 70  },
    E: { STANDARD: 130, EXPRESS: 200, SURFACE: 90  },
  };

  const additionalRates: Record<string, Record<string, number>> = {
    A: { STANDARD: 20, EXPRESS: 35, SURFACE: 12 },
    B: { STANDARD: 25, EXPRESS: 45, SURFACE: 15 },
    C: { STANDARD: 32, EXPRESS: 55, SURFACE: 20 },
    D: { STANDARD: 40, EXPRESS: 70, SURFACE: 28 },
    E: { STANDARD: 50, EXPRESS: 85, SURFACE: 35 },
  };

  const services = ["STANDARD", "EXPRESS", "SURFACE"];
  const slabs = [
    { min: 0,    max: 500 },
    { min: 501,  max: 1000 },
    { min: 1001, max: 2000 },
    { min: 2001, max: 5000 },
    { min: 5001, max: 10000 },
    { min: 10001, max: 30000 },
  ];

  for (const zone of zones) {
    const zRates = baseRates[zone.code];
    const zAdd = additionalRates[zone.code];
    if (!zRates) continue;

    for (const svc of services) {
      for (const slab of slabs) {
        const slabMultiplier = slab.min === 0 ? 1 : Math.ceil(slab.min / 500);
        await prisma.rateSlab.create({
          data: {
            rateCardId: rateCard.id,
            zoneId: zone.id,
            serviceCode: svc,
            minWeightGrams: slab.min,
            maxWeightGrams: slab.max,
            baseRate: zRates[svc] * slabMultiplier,
            additionalRate: zAdd?.[svc] ?? 0,
          },
        });
      }
    }
  }

  return { ok: true, rateCard, message: "Default rate card created with all zone × service slabs" };
}
