import { aiLogger } from "@oakai/logger";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const log = aiLogger("db");

const createPrismaClient = () => {
  const client = new PrismaClient({
    log: [
      { emit: "stdout", level: "error" },
      // Prisma supports DEBUG strings (eg: prisma*, prisma:client), but they're noisy debug messages.
      // Instead, we forward the typical logs based on ai:db
      { emit: "event", level: "query" },
      { emit: "event", level: "warn" },
    ],
  });

  client.$on("query", (e) => {
    log(e.query);
  });
  client.$on("warn", (e) => {
    log(e.message);
  });

  return client.$extends(withAccelerate());
};

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
