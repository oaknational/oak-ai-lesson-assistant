import { Aila } from "@oakai/aila/src/core/Aila";
import { prisma as globalPrisma } from "@oakai/db";

import { nanoid } from "nanoid";

import type { Config } from "./configTypes";
import { createWebActionsPlugin } from "./webActionsPlugin";

export const defaultConfig: Config = {
  prisma: globalPrisma,
  createAila: async (options) => {
    const webActionsPlugin = createWebActionsPlugin(globalPrisma);
    const createdAila = new Aila({
      ...options,
      plugins: [...(options.plugins ?? []), webActionsPlugin],
      prisma: options.prisma ?? globalPrisma,
      chat: options.chat ?? {
        id: nanoid(),
        userId: undefined,
      },
    });
    await createdAila.initialise();
    return createdAila;
  },
};
