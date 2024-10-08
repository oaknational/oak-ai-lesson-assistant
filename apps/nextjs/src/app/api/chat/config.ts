import { Aila, AilaInitializationOptions } from "@oakai/aila";
import {
  prisma as globalPrisma,
  type PrismaClientWithAccelerate,
} from "@oakai/db";
import { nanoid } from "ai";

import { createWebActionsPlugin } from "./webActionsPlugin";

export interface Config {
  prisma: PrismaClientWithAccelerate;
  createAila: (options: Partial<AilaInitializationOptions>) => Promise<Aila>;
}

export const defaultConfig: Config = {
  prisma: globalPrisma,
  createAila: async (options) => {
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
