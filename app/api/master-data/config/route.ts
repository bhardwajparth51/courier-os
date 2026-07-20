import { NextRequest, NextResponse } from "next/server";
import {
  getServiceTypeConfigs, updateServiceTypeConfig,
  getExpenseCategoryConfigs, updateExpenseCategoryConfig,
  getPaymentModeConfigs,
  seedMasterDataDefaults,
} from "@/lib/services/master-data.service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const section = searchParams.get("section") ?? "all";

    const [serviceTypes, expenseCategories, paymentModes] = await Promise.all([
      section === "services" || section === "all" ? getServiceTypeConfigs() : Promise.resolve([]),
      section === "expenses" || section === "all" ? getExpenseCategoryConfigs() : Promise.resolve([]),
      section === "payments" || section === "all" ? getPaymentModeConfigs() : Promise.resolve([]),
    ]);

    return NextResponse.json({ serviceTypes, expenseCategories, paymentModes });
  } catch (err: any) {
    console.error("[config GET]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, entityType, ...data } = body;

    if (entityType === "serviceType") {
      const item = await updateServiceTypeConfig(id, data);
      return NextResponse.json({ item });
    }

    if (entityType === "expenseCategory") {
      const item = await updateExpenseCategoryConfig(id, data);
      return NextResponse.json({ item });
    }

    return NextResponse.json({ error: "Unknown entityType" }, { status: 400 });
  } catch (err: any) {
    console.error("[config PATCH]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.action === "seed") {
      const result = await seedMasterDataDefaults();
      return NextResponse.json(result);
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    console.error("[config POST]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
