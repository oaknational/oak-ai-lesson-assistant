import { aiLogger, structuredLogger } from "@oakai/logger";

import type OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

import type { GenericPromptAgent } from "../schema";
import type { AgentResult } from "../types";

const log = aiLogger("aila:agents:prompts");

/**
 * Telemetry for a single agent LLM call, captured at the point of execution so
 * it can later be persisted as a `Generation` row.
 */
export type PendingGeneration = {
  agentId: string;
  promptTemplateId: string;
  /** The version-stable static prompt body this call used. */
  promptTemplate: string;
  promptInputs?: Record<string, unknown>;
  status: "SUCCESS" | "FAILED";
  llmTimeTaken: number;
  promptTokensUsed: number;
  completionTokensUsed: number;
  response: unknown; // originates from JSON, only narrowed to a JSON value at the persistence boundary
  promptText: string;
};

export type GenerationCollector = (generation: PendingGeneration) => void;

function inputToText(input: GenericPromptAgent<unknown>["input"]): string {
  return input.map((item) => item.content).join("\n");
}

export async function executeGenericPromptAgent<ResponseType>({
  agent,
  openai,
  collectGeneration,
}: {
  agent: GenericPromptAgent<ResponseType>;
  openai: OpenAI;
  collectGeneration?: GenerationCollector;
}): Promise<AgentResult<ResponseType>> {
  const schemaWrapped = z.object({
    value: agent.responseSchema,
  });
  const responseFormat = zodTextFormat(schemaWrapped, `agent_response_schema`);
  const model = agent.modelParams.model;
  const promptText = inputToText(agent.input);
  const promptTemplateId = agent.promptTemplateId ?? agent.id;
  const startTime = Date.now();

  const collect = (
    status: PendingGeneration["status"],
    response: unknown,
    tokenUsage?: { inputTokens?: number; outputTokens?: number },
  ) => {
    collectGeneration?.({
      agentId: agent.id,
      promptTemplateId,
      promptTemplate: agent.promptTemplate ?? "",
      promptInputs: {
        ...agent.promptInputs,
        agentId: agent.id,
        promptTemplateId,
        model,
      },
      status,
      llmTimeTaken: Date.now() - startTime,
      promptTokensUsed: tokenUsage?.inputTokens ?? 0,
      completionTokensUsed: tokenUsage?.outputTokens ?? 0,
      response,
      promptText,
    });
  };

  let result;
  try {
    result = await openai.responses.parse({
      input: agent.input,
      stream: false,
      ...agent.modelParams,
      prompt_cache_key:
        agent.modelParams.prompt_cache_key ?? promptCacheKey({ agent }),
      prompt_cache_retention: agent.modelParams.prompt_cache_retention ?? "24h",
      text: {
        format: responseFormat,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log.error(`OpenAI Responses API error [${agent.id}]: ${message}`);
    collect("FAILED", message);
    return { error: { message } };
  }

  logPromptCacheUsage({ agent, model, usage: result.usage });

  const tokenUsage = {
    inputTokens: result.usage?.input_tokens ?? 0,
    outputTokens: result.usage?.output_tokens ?? 0,
  };

  const refusal =
    result.output[0]?.type === "message" &&
    result.output[0]?.content[0]?.type === "refusal"
      ? result.output[0].content[0].refusal
      : undefined;

  // A refusal or missing/undefined parsed value both mean the agent produced no
  // usable result: record one FAILED generation and surface the reason.
  if (refusal !== undefined || result.output_parsed?.value === undefined) {
    collect("FAILED", result.output_parsed ?? result.output, tokenUsage);
    return {
      error: {
        message:
          refusal ?? "An unknown error occurred\n\n" + JSON.stringify(result),
      },
    };
  }

  collect("SUCCESS", result.output_parsed, tokenUsage);
  return { error: null, data: result.output_parsed.value };
}

function promptCacheKey<ResponseType>({
  agent,
}: {
  agent: GenericPromptAgent<ResponseType>;
}) {
  return ["aila", agent.id]
    .join(":")
    .replace(/[^a-zA-Z0-9:_-]/g, "-")
    .slice(0, 64);
}

function logPromptCacheUsage<ResponseType>({
  agent,
  model,
  usage,
}: {
  agent: GenericPromptAgent<ResponseType>;
  model: unknown;
  usage: OpenAI.Responses.ResponseUsage | null | undefined;
}) {
  const inputTokens = usage?.input_tokens ?? 0;
  const cachedInputTokens = usage?.input_tokens_details?.cached_tokens ?? 0;
  const cacheHitRate =
    inputTokens > 0 ? Number((cachedInputTokens / inputTokens).toFixed(4)) : 0;

  structuredLogger.info(
    {
      agentId: agent.id,
      model,
      inputTokens,
      cachedInputTokens,
      uncachedInputTokens: inputTokens - cachedInputTokens,
      cacheHitRate,
      outputTokens: usage?.output_tokens ?? 0,
      totalTokens: usage?.total_tokens ?? 0,
    },
    "OpenAI Responses prompt cache usage",
  );
}
