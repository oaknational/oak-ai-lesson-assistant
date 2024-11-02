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
    log.info(e.query);
  });
  client.$on("warn", (e) => {
    log.info(e.message);
  });

  return client.$extends(withAccelerate());
};

// Create an instance to extract the type
const extendedPrisma = createPrismaClient();
export type PrismaClientWithAccelerate = typeof extendedPrisma;

let prismaInstance: PrismaClientWithAccelerate | undefined = undefined;

const getPrismaClient = () => {
  if (prismaInstance) {
    return prismaInstance;
  }

  prismaInstance = createPrismaClient();

  return prismaInstance;
};

export const prisma = getPrismaClient();
