import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

async function testConnection(urlName: string, connectionString: string) {
  console.log(`\nTesting ${urlName}: ${connectionString.replace(/:[^:@]+@/, ":****@")}`);
  const cleanUrl = connectionString.replace(/[?&]schema=[^&]*/g, "").replace(/[?&]pgbouncer=[^&]*/g, "");
  const pool = new Pool({
    connectionString: cleanUrl,
    connectionTimeoutMillis: 10000,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    const res = await pool.query("SELECT NOW()");
    console.log(`PG Pool connection SUCCESS for ${urlName}!`, res.rows[0]);
    pool.end();
  } catch (err: any) {
    console.error(`PG Pool connection FAILED for ${urlName}:`, err.message || err);
    pool.end();
  }
}

async function main() {
  await testConnection("DATABASE_URL", process.env.DATABASE_URL || "");
  await testConnection("DIRECT_URL", process.env.DIRECT_URL || "");
}

main().finally(() => process.exit(0));
