import type OpenAI from "openai";
import type { ResponseCreateParamsNonStreaming } from "openai/resources/responses/responses";

// Defaults for Responses API (used by agentic prompt-based agents)
export const DEFAULT_RESPONSES_MODEL: OpenAI.ResponsesModel =
  "gpt-5.4-2026-03-05";

export const DEFAULT_AGENT_MODEL_PARAMS: Omit<
  ResponseCreateParamsNonStreaming,
  "input" | "text" | "stream"
> = {
  model: DEFAULT_RESPONSES_MODEL,
  reasoning: null,
};
