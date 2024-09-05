import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const createPrismaClient = () =>
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  }).$extends(withAccelerate());

// Create an instance to extract the type
const extendedPrisma = createPrismaClient();
export type PrismaClientWithAccelerate = typeof extendedPrisma;

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClientWithAccelerate | undefined;
}

let prisma: PrismaClientWithAccelerate;

if (process.env.NODE_ENV === "production") {
  prisma = createPrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = createPrismaClient();
  }
  prisma = global.prisma;
}

export { prisma };

export * from "@prisma/client";
export * from "./prisma/zod-schemas";
export * from "./schemas";
