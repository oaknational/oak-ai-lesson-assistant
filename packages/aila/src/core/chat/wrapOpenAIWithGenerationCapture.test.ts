import type OpenAI from "openai";

import type { PendingGeneration } from "./AilaStreamHandler";
import { wrapOpenAIWithGenerationCapture } from "./wrapOpenAIWithGenerationCapture";

function createFakeOpenAI(parse: jest.Mock): OpenAI {
  return { responses: { parse } } as unknown as OpenAI;
}

describe("wrapOpenAIWithGenerationCapture", () => {
  it("returns the underlying parse result unchanged", async () => {
    const parse = jest.fn().mockResolvedValue({
      usage: { input_tokens: 1, output_tokens: 2 },
      output: "hi",
    });
    const wrapped = wrapOpenAIWithGenerationCapture(
      createFakeOpenAI(parse),
      () => undefined,
    );

    const result = await wrapped.responses.parse({
      model: "gpt-x",
      input: "hello",
    } as never);

    expect(result).toMatchObject({ usage: { input_tokens: 1, output_tokens: 2 } });
    expect(parse).toHaveBeenCalledTimes(1);
  });

  it("captures a SUCCESS generation with real token usage when the call succeeds", async () => {
    const collected: PendingGeneration[] = [];
    const parse = jest.fn().mockResolvedValue({
      usage: { input_tokens: 11, output_tokens: 22 },
      output: "hi",
    });
    const wrapped = wrapOpenAIWithGenerationCapture(
      createFakeOpenAI(parse),
      (g) => collected.push(g),
    );

    await wrapped.responses.parse({ model: "gpt-x", input: "hello" } as never);

    expect(collected).toHaveLength(1);
    expect(collected[0]).toMatchObject({
      status: "SUCCESS",
      promptTokensUsed: 11,
      completionTokensUsed: 22,
      promptText: "hello",
    });
  });

  it("defaults token usage to zero when the response omits usage", async () => {
    const collected: PendingGeneration[] = [];
    const parse = jest.fn().mockResolvedValue({ output: "hi" });
    const wrapped = wrapOpenAIWithGenerationCapture(
      createFakeOpenAI(parse),
      (g) => collected.push(g),
    );

    await wrapped.responses.parse({ model: "gpt-x", input: "hello" } as never);

    expect(collected[0]).toMatchObject({
      status: "SUCCESS",
      promptTokensUsed: 0,
      completionTokensUsed: 0,
    });
  });

  it("captures a FAILED generation and rethrows when the call throws", async () => {
    const collected: PendingGeneration[] = [];
    const error = new Error("boom");
    const parse = jest.fn().mockRejectedValue(error);
    const wrapped = wrapOpenAIWithGenerationCapture(
      createFakeOpenAI(parse),
      (g) => collected.push(g),
    );

    await expect(
      wrapped.responses.parse({ model: "gpt-x", input: "hello" } as never),
    ).rejects.toThrow("boom");

    expect(collected).toHaveLength(1);
    expect(collected[0]).toMatchObject({
      status: "FAILED",
      promptTokensUsed: 0,
      completionTokensUsed: 0,
      promptText: "hello",
    });
  });
});
