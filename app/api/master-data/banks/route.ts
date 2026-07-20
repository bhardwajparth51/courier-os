import { NextRequest, NextResponse } from "next/server";
import { getBanks, createBank, updateBank, deleteBank } from "@/lib/services/master-data.service";

export async function GET() {
  try {
    const banks = await getBanks();
    return NextResponse.json({ banks });
  } catch (err: any) {
    console.error("[banks GET]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const bank = await createBank(body);
    return NextResponse.json({ bank });
  } catch (err: any) {
    console.error("[banks POST]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...data } = body;
    const bank = await updateBank(id, data);
    return NextResponse.json({ bank });
  } catch (err: any) {
    console.error("[banks PATCH]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    await deleteBank(id);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[banks DELETE]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
