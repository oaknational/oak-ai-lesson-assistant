import { aiLogger } from "@oakai/logger";

import type OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

import type { GenericPromptAgent } from "../schema";
import type { AgentResult } from "../types";

const log = aiLogger("aila:llm");

/**
 * Telemetry for a single agent LLM call, captured at the point of execution so
 * it can later be persisted as a `Generation` row.
 */
export type PendingGeneration = {
  agentId: string;
  promptTemplateId: string;
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
  agentId,
  promptTemplateId = agentId,
  openai,
  collectGeneration,
  promptInputs,
}: {
  agent: GenericPromptAgent<ResponseType>;
  agentId: string;
  promptTemplateId?: string;
  openai: OpenAI;
  collectGeneration?: GenerationCollector;
  promptInputs?: Record<string, unknown>;
}): Promise<AgentResult<ResponseType>> {
  const schemaWrapped = z.object({
    value: agent.responseSchema,
  });
  const responseFormat = zodTextFormat(schemaWrapped, `agent_response_schema`);
  const promptText = inputToText(agent.input);
  const startTime = Date.now();
  const collect = (
    status: PendingGeneration["status"],
    llmTimeTaken: number,
    response: unknown,
    tokenUsage?: { inputTokens?: number; outputTokens?: number },
  ) => {
    collectGeneration?.({
      agentId,
      promptTemplateId,
      promptInputs: {
        ...promptInputs,
        agentId,
        promptTemplateId,
        model: agent.modelParams.model,
      },
      status,
      llmTimeTaken,
      promptTokensUsed: tokenUsage?.inputTokens ?? 0,
      completionTokensUsed: tokenUsage?.outputTokens ?? 0,
      response,
      promptText,
    });
  };

  const parse = () =>
    openai.responses.parse({
      input: agent.input,
      stream: false,
      ...agent.modelParams,
      text: {
        format: responseFormat,
      },
    });

  let result: Awaited<ReturnType<typeof parse>>;
  try {
    result = await parse();
  } catch (error) {
    const llmTimeTaken = Date.now() - startTime;
    log.error(
      "Agent %s LLM call failed after %dms",
      agentId,
      llmTimeTaken,
      error,
    );
    collect(
      "FAILED",
      llmTimeTaken,
      error instanceof Error ? error.message : String(error),
    );
    throw error;
  }

  const llmTimeTaken = Date.now() - startTime;
  log.info("Agent %s LLM call completed in %dms", agentId, llmTimeTaken);
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
    collect(
      "FAILED",
      llmTimeTaken,
      result.output_parsed ?? result.output,
      tokenUsage,
    );
    return {
      error: {
        message:
          refusal ?? "An unknown error occurred\n\n" + JSON.stringify(result),
      },
    };
  }

  collect("SUCCESS", llmTimeTaken, result.output_parsed, tokenUsage);
  return { error: null, data: result.output_parsed.value };
}
