import type { Aila } from "@oakai/aila/src/core/Aila";
import type { AilaInitializationOptions } from "@oakai/aila/src/core/types";
import type { OakPrismaClient } from "@oakai/db";

export interface Config {
  prisma: OakPrismaClient;
  createAila: (options: Partial<AilaInitializationOptions>) => Promise<Aila>;
}
