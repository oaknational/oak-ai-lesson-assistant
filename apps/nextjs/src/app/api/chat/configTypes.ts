import type { Aila } from "@oakai/aila/src/core/Aila";
import type { AilaInitializationOptions } from "@oakai/aila/src/core/types";
import type { PrismaClientWithAccelerate } from "@oakai/db";

export interface Config {
  prisma: PrismaClientWithAccelerate;
  createAila: (options: Partial<AilaInitializationOptions>) => Promise<Aila>;
}
