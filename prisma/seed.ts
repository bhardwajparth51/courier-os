import { PrismaClient, ShipmentStatus, ServiceType, PaymentMethod, PaymentStatus, ParcelType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import { loadEnvConfig } from "@next/env";

// Load .env.local
loadEnvConfig(process.cwd());

const rawUrl = (process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "")
  .replace(/[?&]schema=[^&]*/g, "")
  .replace(/[?&]pgbouncer=[^&]*/g, "");

const pool = new Pool({ connectionString: rawUrl });
const adapter = new PrismaPg(pool, { schema: "courieros" });
const prisma = new PrismaClient({ adapter });

// ─── Helpers ───────────────────────────────────────────────────
function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function generateAWB(): string {
  const prefix = "DTDC";
  const digits = Math.floor(Math.random() * 900000000 + 100000000).toString();
  return `${prefix}${digits}`;
}

// ─── Static data ─────────────────────────────────────────────
const INDIAN_CITIES = [
  { city: "Delhi", state: "Delhi", pincode: "110001" },
  { city: "Mumbai", state: "Maharashtra", pincode: "400001" },
  { city: "Bangalore", state: "Karnataka", pincode: "560001" },
  { city: "Chennai", state: "Tamil Nadu", pincode: "600001" },
  { city: "Kolkata", state: "West Bengal", pincode: "700001" },
  { city: "Hyderabad", state: "Telangana", pincode: "500001" },
  { city: "Pune", state: "Maharashtra", pincode: "411001" },
  { city: "Jaipur", state: "Rajasthan", pincode: "302001" },
  { city: "Lucknow", state: "Uttar Pradesh", pincode: "226001" },
  { city: "Chandigarh", state: "Punjab", pincode: "160001" },
  { city: "Ahmedabad", state: "Gujarat", pincode: "380001" },
  { city: "Surat", state: "Gujarat", pincode: "395001" },
  { city: "Indore", state: "Madhya Pradesh", pincode: "452001" },
  { city: "Bhopal", state: "Madhya Pradesh", pincode: "462001" },
  { city: "Nagpur", state: "Maharashtra", pincode: "440001" },
  { city: "Patna", state: "Bihar", pincode: "800001" },
  { city: "Ludhiana", state: "Punjab", pincode: "141001" },
  { city: "Agra", state: "Uttar Pradesh", pincode: "282001" },
  { city: "Coimbatore", state: "Tamil Nadu", pincode: "641001" },
  { city: "Kochi", state: "Kerala", pincode: "682001" },
];

const FIRST_NAMES = ["Rajesh", "Priya", "Amit", "Sunita", "Vikram", "Pooja", "Suresh", "Anjali", "Ravi", "Meera", "Kiran", "Deepa", "Arun", "Kavita", "Manoj", "Sonia", "Rahul", "Nisha", "Sanjay", "Rekha", "Ashok", "Divya", "Vinod", "Lakshmi", "Prakash", "Usha", "Naresh", "Geeta", "Ramesh", "Sarla", "Vijay", "Asha", "Dinesh", "Sunita", "Harish", "Poonam", "Mukesh", "Rita", "Sunil", "Anita"];
const LAST_NAMES  = ["Sharma", "Verma", "Gupta", "Singh", "Kumar", "Patel", "Joshi", "Mehta", "Aggarwal", "Mishra", "Yadav", "Jain", "Saxena", "Bose", "Nair", "Pillai", "Reddy", "Rao", "Sinha", "Pandey"];

function randomName() {
  return `${randomItem(FIRST_NAMES)} ${randomItem(LAST_NAMES)}`;
}
function randomEmail(name: string, n: number) {
  return `${name.toLowerCase().replace(/\s+/g, ".")}${n}@example.com`;
}
function randomPhone() {
  return `9${randomInt(100000000, 999999999)}`;
}

// ─── Shipment status journey ─────────────────────────────────

function buildTrackingJourney(
  status: ShipmentStatus,
  origin: { city: string; state: string },
  dest: { city: string; state: string },
  createdAt: Date
): Array<{ status: ShipmentStatus; location: string; description: string; timestamp: Date }> {
  const pipeline: Array<{ status: ShipmentStatus; location: string; desc: string; hoursAfter: number }> = [
    { status: "BOOKED",           location: `DTDC Franchise, Pune`,             desc: "Shipment booked at franchise",                    hoursAfter: 0  },
    { status: "AWAITING_PICKUP",  location: `DTDC Franchise, Pune`,             desc: "Shipment ready for DTDC pickup",                  hoursAfter: 1  },
    { status: "COLLECTED",        location: `DTDC Franchise, Pune`,             desc: "Parcel collected by DTDC courier",                hoursAfter: 3  },
    { status: "ORIGIN_HUB",       location: `DTDC Hub, ${origin.city}`,         desc: `Arrived at ${origin.city} origin hub`,           hoursAfter: 8  },
    { status: "REGIONAL_HUB",     location: `DTDC Regional Hub, ${origin.state}`, desc: "In transit through regional sorting",          hoursAfter: 18 },
    { status: "SORTING_CENTER",   location: `DTDC National Sorting Center`,     desc: "Processed at national sorting center",           hoursAfter: 30 },
    { status: "DESTINATION_HUB",  location: `DTDC Hub, ${dest.city}`,           desc: `Arrived at ${dest.city} destination hub`,       hoursAfter: 48 },
    { status: "OUT_FOR_DELIVERY", location: `${dest.city}, ${dest.state}`,      desc: "Out for delivery",                               hoursAfter: 52 },
    { status: "DELIVERED",        location: `${dest.city}, ${dest.state}`,      desc: "Successfully delivered to recipient",            hoursAfter: 56 },
  ];

  // Only include stages up to (and including) current status
  const statusOrder = pipeline.map((p) => p.status);
  const currentIdx = statusOrder.indexOf(status);
  const stages = pipeline.slice(0, currentIdx + 1);

  return stages.map((s) => {
    const ts = new Date(createdAt.getTime() + s.hoursAfter * 3600 * 1000);
    return { status: s.status, location: s.location, description: s.desc, timestamp: ts };
  });
}

function freightCharge(weight: number, service: ServiceType): number {
  const base: Record<ServiceType, number> = {
    EXPRESS: 120,
    STANDARD: 60,
    SURFACE: 40,
    INTERNATIONAL: 800,
  };
  return Math.round((base[service] + weight * 30) / 10) * 10;
}

// ─── Seed ────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding CourierOS database...\n");

  // ── 1. Branch ─────────────────────────────────────────────────
  const branch = await prisma.branch.upsert({
    where: { id: "branch_dtdc_pune" },
    update: {},
    create: {
      id: "branch_dtdc_pune",
      name: "DTDC Pankaj Agencies",
      address: "Shop 12, Karve Road, Deccan Gymkhana",
      city: "Pune",
      state: "Maharashtra",
      pincode: "411004",
      phone: "9876543210",
      email: "pankajagencies.dtdc@gmail.com",
      settings: {
        create: {
          gstNumber: "27AABCU9603R1ZX",
          branchCode: "PNQ-1142",
          dtdcFranchiseId: "DTDC-MH-PNQ-1142",
          ownerName: "Pankaj Mehta",
          ownerPhone: "9822001122",
          workingHoursFrom: "09:00",
          workingHoursTo: "19:00",
          pickupSchedule: "10:00 AM, 04:00 PM",
        },
      },
    },
  });
  console.log("✅ Branch created:", branch.name);

  // ── 2. Passwords ────────────────────────────────────────────
  const ownerHash  = await bcrypt.hash("owner123", 10);
  const empHash    = await bcrypt.hash("emp123", 10);
  const custHash   = await bcrypt.hash("cust123", 10);

  // ── 3. Owner ───────────────────────────────────────────────
  const ownerUser = await prisma.user.upsert({
    where: { email: "owner@dtdc.demo" },
    update: {},
    create: {
      name: "Pankaj Mehta",
      email: "owner@dtdc.demo",
      password: ownerHash,
      phone: "9822001122",
      role: "OWNER",
    },
  });
  console.log("✅ Owner:", ownerUser.email);

  // ── 4. Employees ───────────────────────────────────────────
  const employeeData = [
    { name: "Ravi Kumar",    email: "emp1@dtdc.demo",  staffId: "EMP-001", designation: "Booking Clerk",  score: 92 },
    { name: "Sunita Verma",  email: "emp2@dtdc.demo",  staffId: "EMP-002", designation: "Delivery Staff", score: 85 },
    { name: "Manoj Singh",   email: "emp3@dtdc.demo",  staffId: "EMP-003", designation: "Booking Clerk",  score: 78 },
    { name: "Priya Sharma",  email: "emp4@dtdc.demo",  staffId: "EMP-004", designation: "Counter Staff",  score: 88 },
  ];

  const employees = [];
  for (const emp of employeeData) {
    const user = await prisma.user.upsert({
      where: { email: emp.email },
      update: {},
      create: {
        name: emp.name,
        email: emp.email,
        password: empHash,
        phone: randomPhone(),
        role: "EMPLOYEE",
      },
    });
    const employee = await prisma.employee.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        branchId: branch.id,
        staffId: emp.staffId,
        designation: emp.designation,
        phone: randomPhone(),
        performanceScore: emp.score,
      },
    });
    employees.push(employee);
    console.log(`✅ Employee: ${emp.name} (${emp.staffId})`);
  }

  // ── 5. Customers ─────────────────────────────────────────
  const customers = [];
  for (let i = 1; i <= 50; i++) {
    const name  = i === 1 ? "Anil Joshi" : randomName();
    const email = i === 1 ? "cust1@dtdc.demo" : randomEmail(name, i);
    const loc   = randomItem(INDIAN_CITIES);

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        name,
        email,
        password: custHash,
        phone: randomPhone(),
        role: "CUSTOMER",
      },
    });

    const customer = await prisma.customer.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        phone: randomPhone(),
        address: `${randomInt(1, 999)}, ${randomItem(["Gandhi Marg", "Nehru Road", "MG Road", "Station Road", "Park Street"])}`,
        city: loc.city,
        state: loc.state,
        pincode: loc.pincode,
      },
    });
    customers.push({ customer, loc });
  }
  console.log(`✅ ${customers.length} Customers created`);

  // ── 6. Inventory ─────────────────────────────────────────────
  const inventoryItems = [
    { name: "Packing Boxes (Small)",  category: "Packaging", stock: 148, reorder: 20, unit: "pcs",    vendor: "Packaging Hub Pune" },
    { name: "Packing Boxes (Medium)", category: "Packaging", stock: 92,  reorder: 15, unit: "pcs",    vendor: "Packaging Hub Pune" },
    { name: "Packing Boxes (Large)",  category: "Packaging", stock: 45,  reorder: 10, unit: "pcs",    vendor: "Packaging Hub Pune" },
    { name: "Bubble Wrap",            category: "Packaging", stock: 12,  reorder: 5,  unit: "rolls",  vendor: "Packaging Hub Pune" },
    { name: "Packing Tape",           category: "Packaging", stock: 38,  reorder: 10, unit: "rolls",  vendor: "Office Supplies Co." },
    { name: "Fragile Stickers",       category: "Packaging", stock: 5,   reorder: 10, unit: "sheets", vendor: "Print Fast Pune" },  // low stock
    { name: "Thermal Label Rolls",    category: "Printing",  stock: 8,   reorder: 5,  unit: "rolls",  vendor: "PrintTech Solutions" },
    { name: "Printer Ink Cartridge",  category: "Printing",  stock: 3,   reorder: 3,  unit: "pcs",    vendor: "HP Authorized Dealer" }, // critical
    { name: "A4 Paper (500 sheets)",  category: "Printing",  stock: 22,  reorder: 5,  unit: "reams",  vendor: "Office Supplies Co." },
    { name: "Receipt Books",          category: "Office",    stock: 14,  reorder: 5,  unit: "books",  vendor: "Stationery World" },
    { name: "Hand Sanitizer",         category: "Office",    stock: 6,   reorder: 5,  unit: "bottles", vendor: "Local Mart" },
    { name: "DTDC Courier Bags",      category: "Packaging", stock: 200, reorder: 50, unit: "pcs",    vendor: "DTDC HQ Supply" },
  ];

  for (const item of inventoryItems) {
    const inv = await prisma.inventory.create({
      data: {
        branchId: branch.id,
        itemName: item.name,
        category: item.category,
        currentStock: item.stock,
        reorderLevel: item.reorder,
        unit: item.unit,
        vendor: item.vendor,
        lastPurchaseDate: daysAgo(randomInt(5, 30)),
      },
    });

    // Add a few transactions per item
    await prisma.inventoryTransaction.create({
      data: {
        inventoryId: inv.id,
        type: "STOCK_IN",
        quantity: item.stock + randomInt(5, 20),
        reference: `PO-2024-${String(randomInt(100, 999))}`,
        vendor: item.vendor,
        date: daysAgo(randomInt(15, 45)),
        note: "Regular stock replenishment",
      },
    });

    if (Math.random() > 0.4) {
      await prisma.inventoryTransaction.create({
        data: {
          inventoryId: inv.id,
          type: "STOCK_OUT",
          quantity: randomInt(5, 20),
          date: daysAgo(randomInt(1, 14)),
          note: "Daily operations usage",
        },
      });
    }
  }
  console.log("✅ Inventory seeded");

  // ── 7. Shipments (200) ───────────────────────────────────────
  const STATUSES: ShipmentStatus[] = [
    "DELIVERED", "DELIVERED", "DELIVERED", "DELIVERED", // 40% delivered
    "OUT_FOR_DELIVERY", "OUT_FOR_DELIVERY",              // 10%
    "DESTINATION_HUB", "SORTING_CENTER",                 // 10%
    "REGIONAL_HUB", "ORIGIN_HUB",                       // 10%
    "COLLECTED", "AWAITING_PICKUP",                      // 10%
    "BOOKED",                                            // 5%
    "CANCELLED", "RTO",                                  // 5%
    "DELIVERED", "OUT_FOR_DELIVERY", "COLLECTED",        // fill to 200
  ];

  const SERVICES: ServiceType[] = ["EXPRESS", "EXPRESS", "STANDARD", "STANDARD", "STANDARD", "SURFACE", "INTERNATIONAL"];
  const PAY_METHODS: PaymentMethod[] = ["CASH", "CASH", "UPI", "UPI", "CARD", "COD"];
  const PARCEL_TYPES: ParcelType[] = ["DOCUMENT", "PARCEL", "PARCEL", "PARCEL", "FRAGILE", "HEAVY_CARGO"];

  let shipmentCount = 0;
  let invoiceCounter = 1000;

  for (let i = 0; i < 200; i++) {
    const originLoc = { city: "Pune", state: "Maharashtra", pincode: "411004" };
    const destLoc   = randomItem(INDIAN_CITIES);
    const status    = randomItem(STATUSES);
    const service   = randomItem(SERVICES);
    const method    = randomItem(PAY_METHODS);
    const parcel    = randomItem(PARCEL_TYPES);
    const weight    = parseFloat((Math.random() * 9.5 + 0.5).toFixed(2));
    const freight   = freightCharge(weight, service);
    const fuel      = Math.round(freight * 0.08);
    const insurance = Math.random() > 0.7 ? Math.round(freight * 0.02) : 0;
    const codAmt    = method === "COD" ? randomInt(200, 3000) : 0;
    const total     = freight + fuel + insurance;
    const declaredVal = randomInt(200, 15000);
    const createdAt   = daysAgo(randomInt(0, 90));
    const expectedDel = new Date(createdAt);
    expectedDel.setDate(expectedDel.getDate() + (service === "EXPRESS" ? 2 : service === "STANDARD" ? 4 : service === "SURFACE" ? 7 : 14));

    const employee   = randomItem(employees);
    const custEntry  = randomItem(customers);
    const awb        = generateAWB();
    const senderName = randomName();

    const shipment = await prisma.shipment.create({
      data: {
        awbNumber:       awb,
        branchId:        branch.id,
        senderName,
        senderPhone:     randomPhone(),
        senderAddress:   "DTDC Franchise, Karve Road",
        senderCity:      originLoc.city,
        senderState:     originLoc.state,
        senderPincode:   originLoc.pincode,
        customerId:      custEntry.customer.id,
        receiverName:    randomName(),
        receiverPhone:   randomPhone(),
        receiverAddress: `${randomInt(1, 999)}, ${randomItem(["Main Street", "Park Road", "MG Road", "Civil Lines"])}`,
        receiverCity:    destLoc.city,
        receiverState:   destLoc.state,
        receiverPincode: destLoc.pincode,
        parcelType:      parcel,
        weight,
        declaredValue:   declaredVal,
        hasInsurance:    insurance > 0,
        insuranceAmount: declaredVal,
        serviceType:     service,
        status,
        pickupRequired:  Math.random() > 0.6,
        freightCharge:   freight,
        fuelSurcharge:   fuel,
        insuranceCharge: insurance,
        codAmount:       codAmt,
        totalAmount:     total,
        paymentMethod:   method,
        handledById:     employee.id,
        createdAt,
        expectedDelivery: expectedDel,
      },
    });

    // Tracking events
    const events = buildTrackingJourney(status, originLoc, destLoc, createdAt);
    for (const ev of events) {
      await prisma.trackingEvent.create({
        data: {
          shipmentId:  shipment.id,
          status:      ev.status,
          location:    ev.location,
          description: ev.description,
          timestamp:   ev.timestamp,
        },
      });
    }

    // Payment
    const payStatus: PaymentStatus =
      status === "CANCELLED" ? "REFUNDED" :
      status === "BOOKED" ? "PENDING" : "COLLECTED";

    await prisma.payment.create({
      data: {
        shipmentId:  shipment.id,
        method,
        amount:      total,
        codAmount:   codAmt,
        status:      payStatus,
        collectedAt: payStatus === "COLLECTED" ? createdAt : undefined,
      },
    });

    // Invoice
    invoiceCounter++;
    await prisma.invoice.create({
      data: {
        shipmentId:    shipment.id,
        invoiceNumber: `INV-${invoiceCounter}`,
        amount:        total,
        tax:           Math.round(total * 0.18),
        total:         Math.round(total * 1.18),
        issuedAt:      createdAt,
      },
    });

    shipmentCount++;
    if (shipmentCount % 50 === 0) console.log(`   📦 ${shipmentCount} shipments created...`);
  }

  console.log(`✅ ${shipmentCount} Shipments with tracking, payments & invoices created`);
  console.log("\n🎉 Seed complete!\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Demo Login Credentials");
  console.log("  Owner    → owner@dtdc.demo   / owner123");
  console.log("  Employee → emp1@dtdc.demo    / emp123");
  console.log("  Customer → cust1@dtdc.demo   / cust123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });

