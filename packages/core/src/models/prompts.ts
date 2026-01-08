import type { PrismaClientWithAccelerate } from "@oakai/db";
import type { StructuredLogger } from "@oakai/logger";
import { structuredLogger } from "@oakai/logger";

import type { Logger as InngestLogger } from "inngest";
import { PromptTemplate } from "langchain/prompts";

// When we add structured parsing we can find a better type than this
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };
export type Json = { [key: string]: JsonValue };

export class Prompts {
  constructor(
    private readonly prisma: PrismaClientWithAccelerate,
    // inngest's logger doesn't allow child logger creation, so make
    // sure we accept instances of that too
    private readonly logger:
      | StructuredLogger
      | InngestLogger = structuredLogger,
  ) {}

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

  async formatPrompt(
    promptTemplate: string,
    promptInputs: Record<string, unknown>,
  ): Promise<string> {
    const template = PromptTemplate.fromTemplate(promptTemplate);

    return await template.format(promptInputs);
  }
}
