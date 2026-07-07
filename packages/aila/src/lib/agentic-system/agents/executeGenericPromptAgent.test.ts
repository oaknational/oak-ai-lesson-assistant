import type OpenAI from "openai";
import { z } from "zod";

import type { GenericPromptAgent } from "../schema";
import {
  type PendingGeneration,
  executeGenericPromptAgent,
} from "./executeGenericPromptAgent";

function createFakeOpenAI(parse: jest.Mock): OpenAI {
  return { responses: { parse } } as unknown as OpenAI;
}

const agent: GenericPromptAgent<{ title: string }> = {
  responseSchema: z.object({ title: z.string() }),
  input: [
    { role: "developer", content: "system prompt" },
    { role: "user", content: "make a lesson" },
  ],
  modelParams: { model: "gpt-x" },
};

describe("executeGenericPromptAgent", () => {
  it("returns the parsed value on success", async () => {
    const parse = jest.fn().mockResolvedValue({
      output: [],
      output_parsed: { value: { title: "A lesson" } },
      usage: { input_tokens: 5, output_tokens: 7 },
    });

    const result = await executeGenericPromptAgent({
      agent,
      agentId: "planner",
      openai: createFakeOpenAI(parse),
    });

    expect(result).toEqual({ error: null, data: { title: "A lesson" } });
  });

  it("captures a SUCCESS generation attributed to the agent", async () => {
    const collected: PendingGeneration[] = [];
    const parse = jest.fn().mockResolvedValue({
      output: [],
      output_parsed: { value: { title: "A lesson" } },
      usage: { input_tokens: 5, output_tokens: 7 },
    });

    await executeGenericPromptAgent({
      agent,
      agentId: "cycle--default",
      openai: createFakeOpenAI(parse),
      collectGeneration: (g) => collected.push(g),
    });

    expect(collected).toHaveLength(1);
    expect(collected[0]).toMatchObject({
      agentId: "cycle--default",
      promptTemplateId: "cycle--default",
      promptInputs: {
        agentId: "cycle--default",
        promptTemplateId: "cycle--default",
        model: "gpt-x",
      },
      status: "SUCCESS",
      promptTokensUsed: 5,
      completionTokensUsed: 7,
      // Developer + user messages joined, not the raw response envelope.
      promptText: "system prompt\nmake a lesson",
      response: { value: { title: "A lesson" } },
    });
  });

  it("does not require a collector", async () => {
    const parse = jest.fn().mockResolvedValue({
      output: [],
      output_parsed: { value: { title: "A lesson" } },
    });

    await expect(
      executeGenericPromptAgent({
        agent,
        agentId: "planner",
        openai: createFakeOpenAI(parse),
      }),
    ).resolves.toMatchObject({ error: null });
  });

  it("captures a FAILED generation and rethrows when the call throws", async () => {
    const collected: PendingGeneration[] = [];
    const parse = jest.fn().mockRejectedValue(new Error("boom"));

    await expect(
      executeGenericPromptAgent({
        agent,
        agentId: "planner",
        openai: createFakeOpenAI(parse),
        collectGeneration: (g) => collected.push(g),
      }),
    ).rejects.toThrow("boom");

    expect(collected).toHaveLength(1);
    expect(collected[0]).toMatchObject({
      agentId: "planner",
      promptTemplateId: "planner",
      status: "FAILED",
      promptTokensUsed: 0,
      completionTokensUsed: 0,
      response: "boom",
    });
  });

  it("captures a FAILED generation when the model refuses", async () => {
    const collected: PendingGeneration[] = [];
    const parse = jest.fn().mockResolvedValue({
      output: [
        {
          type: "message",
          content: [{ type: "refusal", refusal: "I can't help with that." }],
        },
      ],
      output_parsed: null,
      usage: { input_tokens: 3, output_tokens: 4 },
    });

    const result = await executeGenericPromptAgent({
      agent,
      agentId: "planner",
      openai: createFakeOpenAI(parse),
      collectGeneration: (g) => collected.push(g),
    });

    expect(result).toEqual({ error: { message: "I can't help with that." } });
    expect(collected).toHaveLength(1);
    expect(collected[0]).toMatchObject({
      agentId: "planner",
      promptTemplateId: "planner",
      status: "FAILED",
      promptTokensUsed: 3,
      completionTokensUsed: 4,
    });
  });

  it("captures a FAILED generation when parsed output is unusable", async () => {
    const collected: PendingGeneration[] = [];
    const parse = jest.fn().mockResolvedValue({
      output: [{ type: "message", content: [] }],
      output_parsed: null,
      usage: { input_tokens: 8, output_tokens: 9 },
    });

    const result = await executeGenericPromptAgent({
      agent,
      agentId: "planner",
      openai: createFakeOpenAI(parse),
      collectGeneration: (g) => collected.push(g),
    });

    expect(result.error?.message).toContain("An unknown error occurred");
    expect(collected).toHaveLength(1);
    expect(collected[0]).toMatchObject({
      agentId: "planner",
      promptTemplateId: "planner",
      status: "FAILED",
      promptTokensUsed: 8,
      completionTokensUsed: 9,
    });
  });
});
