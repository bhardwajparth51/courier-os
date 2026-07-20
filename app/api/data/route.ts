import { NextRequest, NextResponse } from "next/server";
import {
  exportShipments, exportCustomers, exportFinance,
  exportCOD, exportEmployees, exportRateCard,
  exportBackupJSON,
} from "@/lib/services/export.service";
import {
  importCustomers, importEmployees,
  importZonePincodes, importRateSlabs,
  getCustomerImportTemplate, getPincodeImportTemplate,
} from "@/lib/services/import.service";

// GET /api/data?action=export&type=...&format=...
// POST /api/data?action=import&type=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type   = searchParams.get("type")   ?? "";
    const format = searchParams.get("format") ?? "xlsx";
    const from   = searchParams.get("from")   ? new Date(searchParams.get("from")!) : undefined;
    const to     = searchParams.get("to")     ? new Date(searchParams.get("to")!)   : undefined;
    const status = searchParams.get("status") ?? undefined;

    // Templates
    if (type === "template-customers") {
      const buf = getCustomerImportTemplate();
      return new NextResponse(buf, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="customers_import_template.xlsx"`,
        },
      });
    }

    if (type === "template-pincodes") {
      const buf = getPincodeImportTemplate();
      return new NextResponse(buf, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="pincodes_import_template.xlsx"`,
        },
      });
    }

    // JSON backup
    if (type === "backup-json") {
      const json = await exportBackupJSON();
      return new NextResponse(json, {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="courieros_backup_${new Date().toISOString().slice(0,10)}.json"`,
        },
      });
    }

    // XLSX exports
    let buffer: Buffer;
    let filename: string;

    switch (type) {
      case "shipments":
        buffer = await exportShipments({ from, to, status });
        filename = `shipments_${new Date().toISOString().slice(0,10)}.xlsx`;
        break;
      case "customers":
        buffer = await exportCustomers();
        filename = `customers_${new Date().toISOString().slice(0,10)}.xlsx`;
        break;
      case "finance":
        buffer = await exportFinance({ from, to });
        filename = `finance_${new Date().toISOString().slice(0,10)}.xlsx`;
        break;
      case "cod":
        buffer = await exportCOD({ from, to, status });
        filename = `cod_settlements_${new Date().toISOString().slice(0,10)}.xlsx`;
        break;
      case "employees":
        buffer = await exportEmployees();
        filename = `employees_${new Date().toISOString().slice(0,10)}.xlsx`;
        break;
      case "rates":
        buffer = await exportRateCard();
        filename = `rate_card_${new Date().toISOString().slice(0,10)}.xlsx`;
        break;
      default:
        return NextResponse.json({ error: `Unknown export type: ${type}` }, { status: 400 });
    }

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err: any) {
    console.error("[export GET]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") ?? "";
    const rateCardId = searchParams.get("rateCardId") ?? "";

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    let result;

    switch (type) {
      case "customers":
        result = await importCustomers(buffer);
        break;
      case "employees":
        result = await importEmployees(buffer);
        break;
      case "pincodes":
        result = await importZonePincodes(buffer);
        break;
      case "rates":
        if (!rateCardId) return NextResponse.json({ error: "rateCardId required for rate import" }, { status: 400 });
        result = await importRateSlabs(buffer, rateCardId);
        break;
      default:
        return NextResponse.json({ error: `Unknown import type: ${type}` }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[import POST]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
