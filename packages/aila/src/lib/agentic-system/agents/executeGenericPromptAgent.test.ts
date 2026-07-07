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
  id: "cycle--default",
  promptTemplateId: "cycle--default:ks3",
  promptTemplate: "static template body",
  promptInputs: { keyStage: "KS3" },
  responseSchema: z.object({ title: z.string() }),
  input: [
    { role: "developer", content: "system prompt" },
    { role: "user", content: "make a lesson" },
  ],
  modelParams: { model: "gpt-x" },
};

const successResult = {
  output: [],
  output_parsed: { value: { title: "A lesson" } },
  usage: { input_tokens: 5, output_tokens: 7 },
};

describe("executeGenericPromptAgent", () => {
  it("returns the parsed value on success", async () => {
    const parse = jest.fn().mockResolvedValue(successResult);

    const result = await executeGenericPromptAgent({
      agent,
      openai: createFakeOpenAI(parse),
    });

    expect(result).toEqual({ error: null, data: { title: "A lesson" } });
  });

  it("captures a SUCCESS generation with the agent's persistence metadata", async () => {
    const collected: PendingGeneration[] = [];
    const parse = jest.fn().mockResolvedValue(successResult);

    await executeGenericPromptAgent({
      agent,
      openai: createFakeOpenAI(parse),
      collectGeneration: (g) => collected.push(g),
    });

    expect(collected).toHaveLength(1);
    expect(collected[0]).toMatchObject({
      agentId: "cycle--default",
      promptTemplateId: "cycle--default:ks3",
      promptTemplate: "static template body",
      promptInputs: {
        keyStage: "KS3",
        agentId: "cycle--default",
        promptTemplateId: "cycle--default:ks3",
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

  it("defaults promptTemplateId to the agent id when not set", async () => {
    const collected: PendingGeneration[] = [];
    const parse = jest.fn().mockResolvedValue(successResult);

    await executeGenericPromptAgent({
      agent: { ...agent, promptTemplateId: undefined },
      openai: createFakeOpenAI(parse),
      collectGeneration: (g) => collected.push(g),
    });

    expect(collected[0]?.promptTemplateId).toBe("cycle--default");
  });

  it("does not require a collector", async () => {
    const parse = jest.fn().mockResolvedValue(successResult);

    await expect(
      executeGenericPromptAgent({ agent, openai: createFakeOpenAI(parse) }),
    ).resolves.toMatchObject({ error: null });
  });

  it("captures a FAILED generation and returns an error when the call throws", async () => {
    const collected: PendingGeneration[] = [];
    const parse = jest.fn().mockRejectedValue(new Error("boom"));

    const result = await executeGenericPromptAgent({
      agent,
      openai: createFakeOpenAI(parse),
      collectGeneration: (g) => collected.push(g),
    });

    expect(result).toEqual({ error: { message: "boom" } });
    expect(collected).toHaveLength(1);
    expect(collected[0]).toMatchObject({
      agentId: "cycle--default",
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
      openai: createFakeOpenAI(parse),
      collectGeneration: (g) => collected.push(g),
    });

    expect(result).toEqual({ error: { message: "I can't help with that." } });
    expect(collected[0]).toMatchObject({
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
      openai: createFakeOpenAI(parse),
      collectGeneration: (g) => collected.push(g),
    });

    expect(result.error?.message).toContain("An unknown error occurred");
    expect(collected[0]).toMatchObject({
      status: "FAILED",
      promptTokensUsed: 8,
      completionTokensUsed: 9,
    });
  });
});
