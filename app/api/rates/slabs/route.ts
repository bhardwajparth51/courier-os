import { NextRequest, NextResponse } from "next/server";
import {
  getRateCards, createRateCard, activateRateCard, deleteRateCard,
  getSlabsByCard, upsertSlab, deleteSlab,
  seedDefaultRateCard,
} from "@/lib/services/rate-engine.service";

// GET /api/rates/slabs?rateCardId=xxx  → slabs for a card
// GET /api/rates/slabs                  → all rate cards list
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rateCardId = searchParams.get("rateCardId");

  if (rateCardId) {
    const slabs = await getSlabsByCard(rateCardId);
    return NextResponse.json({ slabs });
  }

  const rateCards = await getRateCards();
  return NextResponse.json({ rateCards });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Seed default rate card
  if (body.action === "seed") {
    const result = await seedDefaultRateCard();
    return NextResponse.json(result);
  }

  // Activate a rate card
  if (body.action === "activate") {
    const card = await activateRateCard(body.id);
    return NextResponse.json({ card });
  }

  // Upsert a slab
  if (body.action === "upsertSlab") {
    const { action, ...data } = body;
    const slab = await upsertSlab(data);
    return NextResponse.json({ slab });
  }

  // Delete a slab
  if (body.action === "deleteSlab") {
    await deleteSlab(body.id);
    return NextResponse.json({ ok: true });
  }

  // Create a new rate card
  const card = await createRateCard(body);
  return NextResponse.json({ card });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await deleteRateCard(id);
  return NextResponse.json({ ok: true });
}
