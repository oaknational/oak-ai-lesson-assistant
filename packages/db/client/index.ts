import { aiLogger } from "@oakai/logger";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../generated/prisma/client";
import { createPool } from "./pool";

const log = aiLogger("db");
const shouldLogQueries = process.env.LOG_DB_QUERIES === "true";

const createPrismaClient = () => {
  const client = new PrismaClient({
    // The pool is ours, so $disconnect should close it rather than leave it
    // open until its connections idle out
    adapter: new PrismaPg(createPool(), { disposeExternalPool: true }),
    log: [
      { emit: "stdout", level: "error" },
      // Prisma supports DEBUG strings (eg: prisma*, prisma:client), but they're noisy debug messages.
      // Instead, we forward the typical logs based on ai:db
      { emit: "event", level: "warn" },
      ...(shouldLogQueries
        ? [{ emit: "event" as const, level: "query" as const }]
        : []),
    ],
  });

  if (shouldLogQueries) {
    client.$on("query", (e) => {
      log.info(e.query);
    });
  }
  client.$on("warn", (e) => {
    log.info(e.message);
  });

  return client;
};

export type OakPrismaClient = ReturnType<typeof createPrismaClient>;

declare global {
  // allow global `var` declarations

  var prisma: OakPrismaClient | undefined;
}

// Outside production, reuse one client across hot reloads
const prisma: OakPrismaClient =
  process.env.NODE_ENV === "production"
    ? createPrismaClient()
    : (global.prisma ??= createPrismaClient());

export { prisma };
export { asPrismaJson } from "./json";
