import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

export const extendedPrisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
}).$extends(withAccelerate());

export type PrismaClientWithAccelerate = typeof extendedPrisma;

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClientWithAccelerate | undefined;
}

export * from "@prisma/client";

export * from "./prisma/zod-schemas";
export * from "./schemas";

if (process.env.NODE_ENV !== "production") {
  global.prisma = extendedPrisma;
}

export const prisma: PrismaClientWithAccelerate =
  global.prisma ?? extendedPrisma;
