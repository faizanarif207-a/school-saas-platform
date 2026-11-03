// src/lib/db.ts
// Prisma client — lazy initialization to avoid build-time errors
// The client is only created when first accessed at runtime,
// not at module evaluation time (which happens during Next.js build).

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

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function getClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

// Lazy proxy: only instantiates PrismaClient when a property is accessed
// This avoids "Invalid value undefined for datasource" during Next.js build
export const db = new Proxy({} as PrismaClient, {
  get(_, prop) {
    const client = getClient();
    const value = Reflect.get(client, prop, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
}) as PrismaClient;
