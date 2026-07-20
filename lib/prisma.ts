import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // Strip Prisma-specific ?schema= param — pg adapter uses PrismaPg schema option
  const rawUrl = (process.env.DATABASE_URL ?? "").replace(/[?&]schema=[^&]*/g, "").replace(/[?&]pgbouncer=[^&]*/g, "");
  const pool = new Pool({
    connectionString: rawUrl,
    max: 15,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
  const adapter = new PrismaPg(pool, { schema: "courieros" });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
