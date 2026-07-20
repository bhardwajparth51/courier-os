import { defineConfig } from "prisma/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { loadEnvConfig } from "@next/env";

// Load .env.local so env vars are available in this config file
const { combinedEnv } = loadEnvConfig(process.cwd());

// Strip the Prisma-specific ?schema= param — pg adapter uses search_path instead
const rawUrl = (combinedEnv.DIRECT_URL ?? combinedEnv.DATABASE_URL ?? "").replace(/[?&]schema=[^&]*/g, "");

export default defineConfig({
  earlyAccess: true,
  schema: "prisma/schema.prisma",
  datasource: {
    url: combinedEnv.DIRECT_URL ?? combinedEnv.DATABASE_URL ?? "",
  },
  migrate: {
    async adapter() {
      const pool = new Pool({
        connectionString: rawUrl,
        options: "-c search_path=courieros",
      });
      return new PrismaPg(pool, { schema: "courieros" });
    },
  },
});
