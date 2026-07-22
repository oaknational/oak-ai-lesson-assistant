import type OpenAI from "openai";
import type { ResponseCreateParamsNonStreaming } from "openai/resources/responses/responses";

import { AGENTIC_MODEL_ID } from "../../constants";

// Defaults for Responses API (used by agentic prompt-based agents).
export const DEFAULT_RESPONSES_MODEL =
  AGENTIC_MODEL_ID as OpenAI.ResponsesModel;

export const DEFAULT_AGENT_MODEL_PARAMS: Omit<
  ResponseCreateParamsNonStreaming,
  "input" | "text" | "stream"
> = {
  model: DEFAULT_RESPONSES_MODEL,
  reasoning: null,
};
