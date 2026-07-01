/**
 * Prisma Client helper — lazily instantiated.
 *
 * Important: `new PrismaClient()` throws immediately if `prisma generate`
 * has never been run (it ships a stub that errors on construction, not just
 * on first query). Since this app needs to keep working in pure mock-data
 * mode when no database is configured, we must NOT construct a PrismaClient
 * at module-load time — only inside the code path that actually needs it,
 * and only after confirming DATABASE_URL is set.
 *
 * Usage:
 *   if (isDatabaseConfigured) {
 *     const prisma = getPrismaClient();
 *     const user = await prisma.user.findUnique(...);
 *   }
 *
 * This file is server-only — never import it from a "use client" component.
 */
import type { PrismaClient as PrismaClientType } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClientType };

/** True once someone has actually pointed DATABASE_URL at a real database. */
export const isDatabaseConfigured = Boolean(
  process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0
);

/**
 * Returns a cached PrismaClient instance, creating it on first call.
 * Throws if DATABASE_URL isn't set or if the generated client is missing —
 * callers should always check `isDatabaseConfigured` first and wrap calls
 * in try/catch (see src/lib/auth.ts for the reference pattern).
 */
export function getPrismaClient(): PrismaClientType {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaClient } = require("@prisma/client");
  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  }) as PrismaClientType;

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }
  return client;
}
