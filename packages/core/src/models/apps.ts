import type { PrismaClientWithAccelerate, Prompt } from "@oakai/db";
import { Prisma } from "@oakai/db";
import type { App } from "@prisma/client";

import { Prompts } from "./prompts";

export class Apps {
  prompts: Prompts;

  constructor(private readonly prisma: PrismaClientWithAccelerate) {
    this.prompts = new Prompts(prisma);
  }

  async byId(id: string): Promise<AppWithPrompt | null> {
    return this.prisma.app.findFirst({
      where: { id },
      include: {
        prompts: {
          where: {
            current: true,
          },
        },
      },
    });
  }

  async getAll(): Promise<AppWithPrompt[]> {
    return this.prisma.app.findMany({
      include: {
        prompts: {
          where: {
            current: true,
          },
        },
      },
    });
  }
  async getSharedContent(shareId: string) {
    return this.prisma.sharedContent.findFirst({
      where: { id: shareId },
      cacheStrategy: { ttl: 60 * 5, swr: 60 * 2 },
    });
  }
  async getSingleSessionOutput(sessionId: string, userId: string) {
    return this.prisma.appSession.findFirst({
      where: {
        id: sessionId,
        userId: userId,
        output: {
          not: Prisma.AnyNull,
        },
      },
      include: {
        app: true,
      },
    });
  }
  async getAllSessionOutputs(userId: string) {
    return this.prisma.appSession.findMany({
      where: {
        userId: userId,
        output: {
          not: Prisma.AnyNull,
        },
      },
      include: {
        app: true,
      },
    });
  }
}

export type AppWithPrompt = App & { prompts: Prompt[] };
