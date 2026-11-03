// src/lib/db.ts
// Prisma client with explicit dotenv loading

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  __dbEnvLoaded?: boolean
}

// Force load .env if DATABASE_URL is missing or stale (sqlite)
function ensureEnvLoaded() {
  const url = process.env.DATABASE_URL
  if (!url || url.startsWith('file:')) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('dotenv').config({ override: true })
    } catch {
      // ignore
    }
  }
}

ensureEnvLoaded()

function createPrismaClient() {
  ensureEnvLoaded()
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

// Always create a fresh client if env is sqlite (stale cache scenario)
const currentUrl = process.env.DATABASE_URL
const shouldRecreate =
  !globalForPrisma.prisma ||
  (currentUrl && currentUrl.startsWith('file:')) // stale

export const db = shouldRecreate
  ? (globalForPrisma.prisma = createPrismaClient())
  : globalForPrisma.prisma
