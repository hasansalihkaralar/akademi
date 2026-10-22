import path from "node:path";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function sqliteUrl() {
  const configured = process.env.DATABASE_URL;
  if (configured && !configured.startsWith("file:.")) return configured;
  return `file:${path.join(process.cwd(), "prisma", "dev.db")}`;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: sqliteUrl() } },
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
