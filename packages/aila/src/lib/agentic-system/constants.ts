import type OpenAI from "openai";
import type { ResponseCreateParamsNonStreaming } from "openai/resources/responses/responses";

// Defaults for Responses API (used by agentic prompt-based agents)
export const DEFAULT_RESPONSES_MODEL: OpenAI.ResponsesModel =
  "gpt-5-mini-2025-08-07";

export const DEFAULT_RESPONSES_REASONING: OpenAI.Reasoning = {
  effort: "low",
  summary: "concise",
};

export const DEFAULT_AGENT_MODEL_PARAMS: Omit<
  ResponseCreateParamsNonStreaming,
  "input" | "text" | "stream"
> = {
  model: DEFAULT_RESPONSES_MODEL,
  reasoning: DEFAULT_RESPONSES_REASONING,
};
