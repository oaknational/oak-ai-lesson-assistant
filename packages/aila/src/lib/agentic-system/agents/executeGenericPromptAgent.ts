import { aiLogger } from "@oakai/logger";

import type OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

import type { GenericPromptAgent } from "../schema";
import type { AgentResult } from "../types";

const log = aiLogger("aila:agents:prompts");

export async function executeGenericPromptAgent<ResponseType>({
  agent,
  openai,
}: {
  agent: GenericPromptAgent<ResponseType>;
  openai: OpenAI;
}): Promise<AgentResult<ResponseType>> {
  const schemaWrapped = z.object({
    value: agent.responseSchema,
  });
  const responseFormat = zodTextFormat(schemaWrapped, `agent_response_schema`);
  const model = agent.modelParams.model;

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
    return { error: { message } };
  }

  logPromptCacheUsage({ agent, model, usage: result.usage });

  if (
    result.output[0]?.type === "message" &&
    result.output[0]?.content[0]?.type === "refusal"
  ) {
    return { error: { message: result.output[0]?.content[0]?.refusal } };
  }

  if (!result.output_parsed || result.output_parsed.value === undefined) {
    return {
      error: {
        message: "An unknown error occurred\n\n" + JSON.stringify(result),
      },
    };
  }

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
  const cachedInputTokens = usage?.input_tokens_details.cached_tokens ?? 0;
  const cacheHitRate =
    inputTokens > 0 ? Number((cachedInputTokens / inputTokens).toFixed(4)) : 0;

  log.info("OpenAI Responses prompt cache usage", {
    agentId: agent.id,
    model,
    inputTokens,
    cachedInputTokens,
    uncachedInputTokens: inputTokens - cachedInputTokens,
    cacheHitRate,
    outputTokens: usage?.output_tokens ?? 0,
    totalTokens: usage?.total_tokens ?? 0,
  });
}
