// CourierOS — Pricing Calculation Engine
import { ServiceType, ParcelType, PaymentMethod } from "@prisma/client";

export interface CalculatePricingInput {
  weight: number; // in kg
  length?: number; // cm
  width?: number; // cm
  height?: number; // cm
  parcelType?: ParcelType;
  zone?: "INTRA_CITY" | "REGIONAL" | "NATIONAL" | "METRO" | "INTERNATIONAL";
  serviceType: ServiceType;
  hasInsurance?: boolean;
  declaredValue?: number;
  paymentMethod?: PaymentMethod;
  codAmount?: number;
}

export interface PricingBreakdown {
  subtotal: number;
  baseCharge: number;
  weightCharge: number;
  distanceCharge: number;
  insuranceCharge: number;
  codCharge: number;
  tax: number; // 18% GST
  total: number;
  volumetricWeight: number;
  billableWeight: number;
}

// 1. Calculate Volumetric Weight (L * W * H) / 5000
export function calculateVolumetricWeight(length = 0, width = 0, height = 0): number {
  if (!length || !width || !height) return 0;
  return Math.round(((length * width * height) / 5000) * 100) / 100;
}

// 2. Base Charge per Service Type
export function calculateBaseCharge(serviceType: ServiceType): number {
  switch (serviceType) {
    case "EXPRESS":
      return 120;
    case "STANDARD":
      return 60;
    case "SURFACE":
      return 45;
    case "INTERNATIONAL":
      return 850;
    default:
      return 60;
  }
}

// 3. Weight Charge based on billable weight (max of dead weight & volumetric)
export function calculateWeightCharge(billableWeight: number, serviceType: ServiceType): number {
  const ratePerKg = serviceType === "EXPRESS" ? 35 : serviceType === "INTERNATIONAL" ? 400 : 20;
  const extraWeight = Math.max(0, billableWeight - 0.5); // 0.5kg included in base
  return Math.round(extraWeight * ratePerKg);
}

// 4. Distance Zone Multiplier/Charge
export function calculateDistanceCharge(zone: string = "NATIONAL"): number {
  switch (zone) {
    case "INTRA_CITY":
      return 15;
    case "REGIONAL":
      return 35;
    case "METRO":
      return 55;
    case "NATIONAL":
      return 75;
    case "INTERNATIONAL":
      return 450;
    default:
      return 50;
  }
}

// 5. Insurance Charge (2% of declared value if selected)
export function calculateInsuranceCharge(hasInsurance = false, declaredValue = 0): number {
  if (!hasInsurance || !declaredValue || declaredValue <= 0) return 0;
  return Math.max(25, Math.round(declaredValue * 0.02)); // Min ₹25
}

// 6. COD Handling Charge (1.5% of COD amount if COD method)
export function calculateCodCharge(paymentMethod?: PaymentMethod, codAmount = 0): number {
  if (paymentMethod !== "COD" || !codAmount || codAmount <= 0) return 0;
  return Math.max(30, Math.round(codAmount * 0.015)); // Min ₹30
}

// 7. Calculate 18% GST Tax
export function calculateGST(subtotal: number): number {
  return Math.round(subtotal * 0.18);
}

// 8. Main Pricing Compositor
export function calculateShipmentPrice(input: CalculatePricingInput): PricingBreakdown {
  const deadWeight = Math.max(0.1, input.weight || 0.5);
  const volumetricWeight = calculateVolumetricWeight(input.length, input.width, input.height);
  const billableWeight = Math.max(deadWeight, volumetricWeight);

  const baseCharge = calculateBaseCharge(input.serviceType);
  const weightCharge = calculateWeightCharge(billableWeight, input.serviceType);
  const distanceCharge = calculateDistanceCharge(input.zone || (input.serviceType === "INTERNATIONAL" ? "INTERNATIONAL" : "NATIONAL"));
  const insuranceCharge = calculateInsuranceCharge(input.hasInsurance, input.declaredValue);
  const codCharge = calculateCodCharge(input.paymentMethod, input.codAmount);

  const subtotal = baseCharge + weightCharge + distanceCharge + insuranceCharge + codCharge;
  const tax = calculateGST(subtotal);
  const total = subtotal + tax;

  return {
    subtotal,
    baseCharge,
    weightCharge,
    distanceCharge,
    insuranceCharge,
    codCharge,
    tax,
    total,
    volumetricWeight,
    billableWeight,
  };
}
