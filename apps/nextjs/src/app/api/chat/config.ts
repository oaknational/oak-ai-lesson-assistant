import { Aila } from "@oakai/aila/src/core/Aila";
import type { AilaInitializationOptions } from "@oakai/aila/src/core/types";
import {
  prisma as globalPrisma,
  type PrismaClientWithAccelerate,
} from "@oakai/db/client";
import { nanoid } from "nanoid";

import { createWebActionsPlugin } from "./webActionsPlugin";

export interface Config {
  prisma: PrismaClientWithAccelerate;
  createAila: (options: Partial<AilaInitializationOptions>) => Aila;
}

export const defaultConfig: Config = {
  prisma: globalPrisma,
  createAila: (options: Partial<AilaInitializationOptions>) => {
    const webActionsPlugin = createWebActionsPlugin(globalPrisma);
    return new Aila({
      ...options,
      plugins: [...(options.plugins || []), webActionsPlugin],
      prisma: options.prisma ?? globalPrisma,
      chat: options.chat || {
        id: nanoid(),
        userId: undefined,
      },
    });
  },
};
