import { Prisma } from "@oakai/db/prisma/client";

import type { PendingGeneration } from "../../lib/agentic-system/agents/executeGenericPromptAgent";

type BuildAgenticGenerationRowsArgs = {
  pendingGenerations: PendingGeneration[];
  promptIdsByPromptTemplateId: Record<string, string>;
  userId: string;
  appSessionId: string;
  messageId?: string;
  completedAt?: Date;
};

/**
 * Prisma rejects a bare `null`/`undefined` at the top
 * level of a Json column, so map that to the JSON null sentinel.
 */
function toJsonInput(
  value: unknown,
): Prisma.InputJsonValue | typeof Prisma.JsonNull {
  return value == null ? Prisma.JsonNull : (value as Prisma.InputJsonValue);
}

export function buildAgenticGenerationRows({
  pendingGenerations,
  promptIdsByPromptTemplateId,
  userId,
  appSessionId,
  messageId,
  completedAt = new Date(),
}: BuildAgenticGenerationRowsArgs): Prisma.GenerationCreateManyInput[] {
  return pendingGenerations.map((generation) => {
    const promptId = promptIdsByPromptTemplateId[generation.promptTemplateId];
    if (!promptId) {
      throw new Error(
        `Cannot persist agentic generation for ${generation.agentId}: missing prompt id for ${generation.promptTemplateId}`,
      );
    }

    return {
      promptId,
      status: generation.status,
      llmTimeTaken: generation.llmTimeTaken,
      promptTokensUsed: generation.promptTokensUsed,
      completionTokensUsed: generation.completionTokensUsed,
      promptText: generation.promptText,
      promptInputs: generation.promptInputs
        ? toJsonInput(generation.promptInputs)
        : undefined,
      response: toJsonInput(generation.response),
      userId,
      appId: "lesson-planner",
      completedAt,
      appSessionId,
      messageId,
    };
  });
}
