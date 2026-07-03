import { aiLogger } from "@oakai/logger";

import type OpenAI from "openai";

import type { PendingGeneration } from "./AilaStreamHandler";

const log = aiLogger("aila:llm");

type ResponsesParseParams = Parameters<OpenAI["responses"]["parse"]>[0];
type ResponsesParseResult = Awaited<ReturnType<OpenAI["responses"]["parse"]>>;

function inputToText(input: ResponsesParseParams["input"]): string {
  if (typeof input === "string") return input;
  return input
    .map((item) =>
      "content" in item && typeof item.content === "string" ? item.content : "",
    )
    .join("\n");
}

export function wrapOpenAIWithGenerationCapture(
  openai: OpenAI,
  collectPendingGenerationData: (generation: PendingGeneration) => void,
): OpenAI {
  const wrappedParse = async (
    params: ResponsesParseParams,
  ): Promise<ResponsesParseResult> => {
    const startTime = Date.now();
    const promptText =
      typeof params.input === "string"
        ? params.input
        : inputToText(params.input);

    try {
      const result = await openai.responses.parse(params);
      const duration = Date.now() - startTime;

      log.info(
        "wrapOpenAIWithGenerationCapture: model=%s, duration=%dms",
        String(params.model),
        duration,
      );

      collectPendingGenerationData({
        status: "SUCCESS",
        llmTimeTaken: duration,
        promptTokensUsed: result.usage?.input_tokens ?? 0,
        completionTokensUsed: result.usage?.output_tokens ?? 0,
        response: JSON.stringify(result),
        promptText,
      });
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      log.error(
        "wrapOpenAIWithGenerationCapture: call failed model=%s, duration=%dms",
        String(params.model),
        duration,
      );

      collectPendingGenerationData({
        status: "FAILED",
        llmTimeTaken: duration,
        promptTokensUsed: 0,
        completionTokensUsed: 0,
        response: error instanceof Error ? error.message : String(error),
        promptText,
      });
      throw error;
    }
  };

  const responsesProxy = new Proxy(openai.responses, {
    get(target, prop, receiver) {
      if (prop === "parse") {
        return wrappedParse;
      }
      return Reflect.get(target, prop, receiver) as unknown;
    },
  });

  return new Proxy(openai, {
    get(target, prop, receiver) {
      if (prop === "responses") {
        return responsesProxy;
      }
      const value: unknown = Reflect.get(target, prop, receiver);
      if (typeof value === "function") {
        return (value as (...args: unknown[]) => unknown).bind(
          target,
        ) as unknown;
      } else {
        return value;
      }
    },
  });
}
