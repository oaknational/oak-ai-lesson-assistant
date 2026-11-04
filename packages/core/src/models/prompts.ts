import type { PrismaClientWithAccelerate } from "@oakai/db";

// When we add structured parsing we can find a better type than this
export type JsonValue =
  string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
export type Json = { [key: string]: JsonValue };

export class Prompts {
  constructor(private readonly prisma: PrismaClientWithAccelerate) {}

  async get(promptId: string, appId: string) {
    return this.prisma.prompt.findFirst({
      where: {
        id: promptId,
        app: { id: appId },
        current: true,
      },
      include: { app: true },
      cacheStrategy: { ttl: 60 * 5, swr: 60 * 2 },
    });
  }
}
