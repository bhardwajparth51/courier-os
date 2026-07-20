import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function buildWorkbook(sheets: Record<string, object[]>): Buffer {
  const wb = XLSX.utils.book_new();
  for (const [name, data] of Object.entries(sheets)) {
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31)); // sheet names max 31 chars
  }
  return Buffer.from(XLSX.write(wb, { type: "buffer", bookType: "xlsx" }));
}

function fmtDate(d: Date | null | undefined): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function fmtAmt(n: number | null | undefined): string {
  if (n == null) return "0.00";
  return n.toFixed(2);
}

// ─────────────────────────────────────────────
// SHIPMENTS EXPORT
// ─────────────────────────────────────────────

export async function exportShipments(filters: {
  from?: Date;
  to?: Date;
  status?: string;
  limit?: number;
}) {
  const { from, to, status, limit = 5000 } = filters;

  const shipments = await prisma.shipment.findMany({
    where: {
      ...(status ? { status: status as any } : {}),
      ...(from || to ? { createdAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}),
    },
    include: {
      customer: { select: { user: { select: { name: true, email: true } } } },
      invoice: { select: { invoiceNumber: true, total: true } },
      branch: { select: { name: true, city: true } },
      payment: { select: { status: true, method: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  const rows = shipments.map((s) => ({
    "AWB Number":       s.awbNumber,
    "Booking Date":     fmtDate(s.createdAt),
    "Status":           s.status,
    "Sender Name":      s.senderName,
    "Sender Phone":     s.senderPhone,
    "Sender Address":   s.senderAddress,
    "Origin City":      s.senderCity,
    "Origin Pincode":   s.senderPincode,
    "Receiver Name":    s.receiverName,
    "Receiver Phone":   s.receiverPhone,
    "Receiver Address": s.receiverAddress,
    "Destination City": s.receiverCity,
    "Destination Pin":  s.receiverPincode,
    "Weight (kg)":      s.weight,
    "Parcel Type":      s.parcelType,
    "Service Type":     s.serviceType,
    "Payment Method":   s.paymentMethod,
    "Payment Status":   s.payment?.status ?? "COLLECTED",
    "Freight (₹)":      fmtAmt(s.freightCharge),
    "Fuel Surcharge (₹)": fmtAmt(s.fuelSurcharge),
    "Insurance (₹)":    fmtAmt(s.insuranceCharge),
    "COD Amount (₹)":   fmtAmt(s.codAmount ?? 0),
    "Total Amount (₹)": fmtAmt(s.totalAmount),
    "Customer Account": s.customer?.user?.name ?? "",
    "Branch":           s.branch?.name ?? "",
    "Invoice No":       s.invoice?.invoiceNumber ?? "",
  }));

  return buildWorkbook({ Shipments: rows });
}

// ─────────────────────────────────────────────
// CUSTOMERS EXPORT
// ─────────────────────────────────────────────

export async function exportCustomers() {
  const customers = await prisma.customer.findMany({
    include: {
      user: { select: { name: true, email: true, phone: true } },
      _count: { select: { shipments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const rows = customers.map((c) => ({
    "Customer Code":    c.customerCode ?? `CUST-${c.id.slice(-6)}`,
    "Name":             c.user?.name ?? "",
    "Phone":            c.phone || c.user?.phone || "",
    "Email":            c.user?.email ?? "",
    "Company Name":     c.companyName ?? "",
    "GST Number":       c.gstNumber ?? "",
    "Address":          c.address ?? "",
    "City":             c.city ?? "",
    "State":            c.state ?? "",
    "Pincode":          c.pincode ?? "",
    "Category":         c.category,
    "Health Score":     `${c.healthScore ?? 85}/100`,
    "Credit Limit (₹)": fmtAmt(c.creditLimit ?? 0),
    "Total Shipments":  c._count.shipments,
    "Joined Date":      fmtDate(c.createdAt),
  }));

  return buildWorkbook({ Customers: rows });
}

// ─────────────────────────────────────────────
// FINANCE EXPORT
// ─────────────────────────────────────────────

export async function exportFinance(filters: { from?: Date; to?: Date }) {
  const { from, to } = filters;
  const dateFilter = from || to
    ? { createdAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } }
    : {};

  const invoiceDateFilter = from || to
    ? { issuedAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } }
    : {};

  const [transactions, expenses, invoices, codSettlements] = await Promise.all([
    prisma.cashTransaction.findMany({
      where: dateFilter,
      include: { session: { select: { openedAt: true } } },
      orderBy: { createdAt: "desc" },
      take: 5000,
    }),
    prisma.expense.findMany({
      where: dateFilter,
      orderBy: { createdAt: "desc" },
      take: 2000,
    }),
    prisma.invoice.findMany({
      where: invoiceDateFilter,
      include: { shipment: { select: { awbNumber: true } } },
      orderBy: { issuedAt: "desc" },
      take: 5000,
    }),
    prisma.cODSettlement.findMany({
      where: { ...(from || to ? { reconciledAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}) },
      orderBy: { reconciledAt: "desc" },
      take: 2000,
    }),
  ]);

  const txRows = transactions.map((t) => ({
    "Date":        fmtDate(t.createdAt),
    "Type":        t.type,
    "Category":    t.category,
    "Description": t.description ?? "",
    "Amount (₹)":  fmtAmt(t.amount),
    "Reference":   t.referenceId ?? "",
  }));

  const expRows = expenses.map((e) => ({
    "Date":        fmtDate(e.createdAt),
    "Category":    e.category,
    "Description": e.vendor ?? "",
    "Amount (₹)":  fmtAmt(e.amount),
    "Status":      e.status,
    "Vendor":      e.vendor ?? "",
  }));

  const invRows = invoices.map((i) => ({
    "Invoice No":   i.invoiceNumber,
    "Date":         fmtDate(i.issuedAt),
    "AWB":          i.shipment?.awbNumber ?? "",
    "Subtotal (₹)": fmtAmt(i.amount),
    "Tax (₹)":      fmtAmt(i.tax),
    "Total (₹)":    fmtAmt(i.total),
  }));

  const codRows = codSettlements.map((c) => ({
    "AWB":          c.shipmentId,
    "Amount (₹)":   fmtAmt(c.amount),
    "Status":       c.status,
    "Reconciled":   fmtDate(c.reconciledAt),
  }));

  return buildWorkbook({
    "Cash Transactions": txRows,
    "Expenses":          expRows,
    "Invoices":          invRows,
    "COD Settlements":   codRows,
  });
}

// ─────────────────────────────────────────────
// COD EXPORT
// ─────────────────────────────────────────────

export async function exportCOD(filters: { status?: string; from?: Date; to?: Date }) {
  const { status, from, to } = filters;

  const settlements = await prisma.cODSettlement.findMany({
    where: {
      ...(status ? { status: status as any } : {}),
      ...(from || to ? { reconciledAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}) },
    orderBy: { reconciledAt: "desc" },
    take: 5000,
  });

  const rows = settlements.map((c) => ({
    "Shipment ID":   c.shipmentId,
    "COD Amount (₹)": fmtAmt(c.amount),
    "Status":        c.status,
    "Driver ID":     c.driverId ?? "",
    "Reconciled By": c.reconciledBy ?? "",
    "Reconciled At": fmtDate(c.reconciledAt),
  }));

  return buildWorkbook({ "COD Settlements": rows });
}

// ─────────────────────────────────────────────
// EMPLOYEES EXPORT
// ─────────────────────────────────────────────

export async function exportEmployees() {
  const employees = await prisma.employee.findMany({
    include: {
      user: { select: { name: true, email: true, role: true } },
      branch: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const rows = employees.map((e) => ({
    "Staff ID":          e.staffId,
    "Name":              e.user?.name ?? "",
    "Email":             e.user?.email ?? "",
    "Branch":            e.branch?.name ?? "",
    "Role":              e.user?.role ?? "",
    "Designation":       e.designation ?? "",
    "Phone":             e.phone ?? "",
    "Performance Score": e.performanceScore,
    "Join Date":         fmtDate(e.joiningDate),
    "Active Status":     e.isActive ? "Active" : "Inactive",
  }));

  return buildWorkbook({ Employees: rows });
}

// ─────────────────────────────────────────────
// RATE CARD EXPORT
// ─────────────────────────────────────────────

export async function exportRateCard() {
  const slabs = await prisma.rateSlab.findMany({
    include: { zone: true, rateCard: { select: { name: true, isActive: true } } },
    orderBy: [{ zone: { code: "asc" } }, { serviceCode: "asc" }, { minWeightGrams: "asc" }],
  });

  const rows = slabs.map((s) => ({
    "Rate Card":        s.rateCard.name,
    "Active":           s.rateCard.isActive ? "Yes" : "No",
    "Zone Code":        s.zone.code,
    "Zone Name":        s.zone.name,
    "Service":          s.serviceCode,
    "Min Weight (g)":   s.minWeightGrams,
    "Max Weight (g)":   s.maxWeightGrams,
    "Base Rate (₹)":    fmtAmt(s.baseRate),
    "Additional (₹)":   fmtAmt(s.additionalRate),
  }));

  return buildWorkbook({ "Rate Slabs": rows });
}

// ─────────────────────────────────────────────
// FULL BACKUP EXPORT (JSON + summary sheet)
// ─────────────────────────────────────────────

export async function exportBackupJSON(): Promise<string> {
  const [shipments, customers, expenses, employees, zones, rateCards] = await Promise.all([
    prisma.shipment.findMany({ orderBy: { createdAt: "desc" }, take: 10000 }),
    prisma.customer.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.expense.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.employee.findMany({ include: { user: { select: { name: true, email: true } } } }),
    prisma.zone.findMany({ include: { pincodes: true } }),
    prisma.rateCard.findMany({ include: { slabs: true } }),
  ]);

  const backup = {
    exportedAt: new Date().toISOString(),
    version: "1.0",
    counts: {
      shipments: shipments.length,
      customers: customers.length,
      expenses: expenses.length,
      employees: employees.length,
    },
    data: { shipments, customers, expenses, employees, zones, rateCards },
  };

  return JSON.stringify(backup, null, 2);
}
