import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface ImportResult {
  success: boolean;
  inserted: number;
  skipped: number;
  errors: string[];
}

// ─────────────────────────────────────────────
// XLSX → Array parser
// ─────────────────────────────────────────────

export function parseXLSX(buffer: Buffer): Record<string, any>[] {
  const wb = XLSX.read(buffer, { type: "buffer" });
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(ws, { defval: "" });
}

// ─────────────────────────────────────────────
// CUSTOMERS IMPORT
// ─────────────────────────────────────────────

export async function importCustomers(buffer: Buffer): Promise<ImportResult> {
  const rows = parseXLSX(buffer);
  const errors: string[] = [];
  let inserted = 0;
  let skipped = 0;

  for (const [i, row] of rows.entries()) {
    const name  = String(row["Name"] || row["name"] || "").trim();
    const phone = String(row["Phone"] || row["phone"] || "").trim();
    const email = String(row["Email"] || row["email"] || "").trim() || null;
    const city  = String(row["City"]  || row["city"]  || "").trim() || null;
    const state = String(row["State"] || row["state"] || "").trim() || null;

    if (!name || !phone) {
      errors.push(`Row ${i + 2}: Missing required Name or Phone`);
      skipped++;
      continue;
    }

    try {
      // Upsert by phone number
      await prisma.customer.upsert({
        where: { phone },
        update: { name, email, city, state },
        create: {
          name, phone, email, city, state,
          customerCode: `CUS-${phone.slice(-6)}`,
          category: "RETAIL",
        },
      });
      inserted++;
    } catch (e: any) {
      errors.push(`Row ${i + 2}: ${e.message}`);
      skipped++;
    }
  }

  return { success: errors.length === 0, inserted, skipped, errors };
}

// ─────────────────────────────────────────────
// EMPLOYEES IMPORT
// ─────────────────────────────────────────────

export async function importEmployees(buffer: Buffer): Promise<ImportResult> {
  const rows = parseXLSX(buffer);
  const errors: string[] = [];
  let inserted = 0;
  let skipped = 0;

  for (const [i, row] of rows.entries()) {
    const name        = String(row["Name"]        || "").trim();
    const email       = String(row["Email"]       || "").trim();
    const phone       = String(row["Phone"]       || "").trim() || null;
    const designation = String(row["Designation"] || "").trim() || null;
    const salary      = parseFloat(String(row["Salary"] || "0")) || 0;

    if (!name || !email) {
      errors.push(`Row ${i + 2}: Missing required Name or Email`);
      skipped++;
      continue;
    }

    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        // Update existing employee record
        await prisma.employee.updateMany({
          where: { userId: existingUser.id },
          data: { designation, salary, phone },
        });
      } else {
        // Create user + employee
        const user = await prisma.user.create({
          data: {
            name, email,
            role: "EMPLOYEE",
            password: `temp_${Date.now()}`, // must be reset
          },
        });
        const count = await prisma.employee.count();
        await prisma.employee.create({
          data: {
            userId: user.id,
            staffId: `EMP${String(count + 1).padStart(4, "0")}`,
            designation, salary, phone,
            branchId: (await prisma.branch.findFirst())?.id ?? "default",
          },
        });
      }
      inserted++;
    } catch (e: any) {
      errors.push(`Row ${i + 2}: ${e.message}`);
      skipped++;
    }
  }

  return { success: errors.length === 0, inserted, skipped, errors };
}

// ─────────────────────────────────────────────
// ZONE PINCODE IMPORT
// ─────────────────────────────────────────────

export async function importZonePincodes(buffer: Buffer): Promise<ImportResult> {
  const rows = parseXLSX(buffer);
  const errors: string[] = [];
  let inserted = 0;
  let skipped = 0;

  // Build zone code → id map
  const zones = await prisma.zone.findMany();
  const zoneMap = Object.fromEntries(zones.map((z) => [z.code.toUpperCase(), z.id]));

  for (const [i, row] of rows.entries()) {
    const pincode  = String(row["Pincode"]  || row["pincode"]  || "").trim();
    const city     = String(row["City"]     || row["city"]     || "").trim();
    const state    = String(row["State"]    || row["state"]    || "").trim();
    const zoneCode = String(row["Zone"]     || row["zone"]     || "").trim().toUpperCase();

    if (!pincode || !city || !zoneCode) {
      errors.push(`Row ${i + 2}: Missing Pincode, City, or Zone`);
      skipped++;
      continue;
    }

    const zoneId = zoneMap[zoneCode];
    if (!zoneId) {
      errors.push(`Row ${i + 2}: Zone "${zoneCode}" not found`);
      skipped++;
      continue;
    }

    try {
      await prisma.zonePincode.upsert({
        where: { pincode },
        update: { city, state, zoneId },
        create: { pincode, city, state: state || "", zoneId },
      });
      inserted++;
    } catch (e: any) {
      errors.push(`Row ${i + 2}: ${e.message}`);
      skipped++;
    }
  }

  return { success: errors.length === 0, inserted, skipped, errors };
}

// ─────────────────────────────────────────────
// RATE SLABS IMPORT
// ─────────────────────────────────────────────

export async function importRateSlabs(buffer: Buffer, rateCardId: string): Promise<ImportResult> {
  const rows = parseXLSX(buffer);
  const errors: string[] = [];
  let inserted = 0;
  let skipped = 0;

  const zones = await prisma.zone.findMany();
  const zoneMap = Object.fromEntries(zones.map((z) => [z.code.toUpperCase(), z.id]));

  for (const [i, row] of rows.entries()) {
    const zoneCode    = String(row["Zone Code"]  || row["Zone"] || "").trim().toUpperCase();
    const serviceCode = String(row["Service"]    || "").trim().toUpperCase();
    const minWeight   = parseInt(String(row["Min Weight (g)"] || row["Min Weight"] || "0"));
    const maxWeight   = parseInt(String(row["Max Weight (g)"] || row["Max Weight"] || "0"));
    const baseRate    = parseFloat(String(row["Base Rate (₹)"] || row["Base Rate"] || "0"));
    const addRate     = parseFloat(String(row["Additional (₹)"] || row["Additional"] || "0"));

    if (!zoneCode || !serviceCode || !maxWeight || !baseRate) {
      errors.push(`Row ${i + 2}: Missing required fields`);
      skipped++;
      continue;
    }

    const zoneId = zoneMap[zoneCode];
    if (!zoneId) {
      errors.push(`Row ${i + 2}: Zone "${zoneCode}" not found`);
      skipped++;
      continue;
    }

    try {
      const existing = await prisma.rateSlab.findFirst({
        where: { rateCardId, zoneId, serviceCode, minWeightGrams: minWeight },
      });
      if (existing) {
        await prisma.rateSlab.update({
          where: { id: existing.id },
          data: { baseRate, additionalRate: addRate, maxWeightGrams: maxWeight },
        });
      } else {
        await prisma.rateSlab.create({
          data: { rateCardId, zoneId, serviceCode, minWeightGrams: minWeight, maxWeightGrams: maxWeight, baseRate, additionalRate: addRate },
        });
      }
      inserted++;
    } catch (e: any) {
      errors.push(`Row ${i + 2}: ${e.message}`);
      skipped++;
    }
  }

  return { success: errors.length === 0, inserted, skipped, errors };
}

// ─────────────────────────────────────────────
// Template downloads
// ─────────────────────────────────────────────

export function getCustomerImportTemplate(): Buffer {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet([
    { Name: "Ravi Kumar", Phone: "9876543210", Email: "ravi@example.com", City: "Delhi", State: "Delhi" },
    { Name: "Priya Sharma", Phone: "9123456789", Email: "", City: "Mumbai", State: "Maharashtra" },
  ]);
  XLSX.utils.book_append_sheet(wb, ws, "Customers");
  return Buffer.from(XLSX.write(wb, { type: "buffer", bookType: "xlsx" }));
}

export function getPincodeImportTemplate(): Buffer {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet([
    { Pincode: "110001", City: "New Delhi", State: "Delhi", Zone: "A" },
    { Pincode: "400001", City: "Mumbai", State: "Maharashtra", Zone: "A" },
    { Pincode: "500001", City: "Hyderabad", State: "Telangana", Zone: "B" },
  ]);
  XLSX.utils.book_append_sheet(wb, ws, "Pincodes");
  return Buffer.from(XLSX.write(wb, { type: "buffer", bookType: "xlsx" }));
}
