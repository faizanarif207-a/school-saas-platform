// src/lib/db.ts
// Prisma client optimized for Vercel serverless + Supabase PgBouncer

import { PrismaClient } from "@prisma/client";
import { config as dotenvConfig } from "dotenv";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// In serverless (Vercel), env vars are injected automatically.
// In local dev, ensure .env is loaded if DATABASE_URL is missing or stale.
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith("file:")) {
  try {
    dotenvConfig({ override: true });
  } catch {
    // ignore
  }
}

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
