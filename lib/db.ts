import { PrismaClient } from "@prisma/client";

/**
 * Singleton Prisma pour éviter de multiples instances en dev (HMR Next.js).
 * En prod, une seule instance par container Node.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
