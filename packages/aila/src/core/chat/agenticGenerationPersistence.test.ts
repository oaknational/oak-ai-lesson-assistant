import { Prisma } from "@oakai/db/prisma/client";

import type { PendingGeneration } from "../../lib/agentic-system/agents/executeGenericPromptAgent";
import { buildAgenticGenerationRows } from "./agenticGenerationPersistence";

const completedAt = new Date("2026-01-02T03:04:05.000Z");

const promptIdsByPromptTemplateId = { planner: "prompt_planner" };

function pendingGeneration(
  overrides: Partial<PendingGeneration> = {},
): PendingGeneration {
  return {
    agentId: "planner",
    promptTemplateId: "planner",
    promptTemplate: "planner template body",
    promptInputs: {
      agentId: "planner",
      promptTemplateId: "planner",
      model: "gpt-test",
    },
    status: "SUCCESS",
    llmTimeTaken: 123,
    promptTokensUsed: 10,
    completionTokensUsed: 20,
    response: { value: { title: "A lesson" } },
    promptText: "system prompt\nuser prompt",
    ...overrides,
  };
}

describe("buildAgenticGenerationRows", () => {
  it("maps pending generation telemetry to generation create rows", () => {
    const rows = buildAgenticGenerationRows({
      pendingGenerations: [pendingGeneration()],
      promptIdsByPromptTemplateId,
      userId: "user_123",
      appSessionId: "chat_123",
      messageId: "assistant_123",
      completedAt,
    });

    expect(rows).toEqual([
      {
        promptId: "prompt_planner",
        promptInputs: {
          agentId: "planner",
          promptTemplateId: "planner",
          model: "gpt-test",
        },
        status: "SUCCESS",
        llmTimeTaken: 123,
        promptTokensUsed: 10,
        completionTokensUsed: 20,
        promptText: "system prompt\nuser prompt",
        response: { value: { title: "A lesson" } },
        userId: "user_123",
        appId: "lesson-planner",
        completedAt,
        appSessionId: "chat_123",
        messageId: "assistant_123",
      },
    ]);
  });

  it("maps top-level null to the JSON null sentinel", () => {
    const [row] = buildAgenticGenerationRows({
      pendingGenerations: [pendingGeneration({ response: null })],
      promptIdsByPromptTemplateId,
      userId: "user_123",
      appSessionId: "chat_123",
      completedAt,
    });

    expect(row?.response).toBe(Prisma.JsonNull);
  });

  it("preserves nested nulls in the response", () => {
    const [row] = buildAgenticGenerationRows({
      pendingGenerations: [
        pendingGeneration({ response: { value: { title: null } } }),
      ],
      promptIdsByPromptTemplateId,
      userId: "user_123",
      appSessionId: "chat_123",
      completedAt,
    });

    expect(row?.response).toEqual({ value: { title: null } });
  });

  it("throws when an agent has no resolved prompt id", () => {
    expect(() =>
      buildAgenticGenerationRows({
        pendingGenerations: [
          pendingGeneration({
            agentId: "cycle--default",
            promptTemplateId: "cycle--default",
          }),
        ],
        promptIdsByPromptTemplateId,
        userId: "user_123",
        appSessionId: "chat_123",
        completedAt,
      }),
    ).toThrow("Cannot persist agentic generation for cycle--default");
  });
});
