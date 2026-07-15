import type OpenAI from "openai";
import type { ResponseCreateParamsNonStreaming } from "openai/resources/responses/responses";

import { DEFAULT_MODEL } from "../../constants";

// Defaults for Responses API (used by agentic prompt-based agents).
// On this experiment branch, follow DEFAULT_MODEL so the agents run on the
// same model as the rest of Aila.
export const DEFAULT_RESPONSES_MODEL: OpenAI.ResponsesModel = DEFAULT_MODEL;

export const DEFAULT_AGENT_MODEL_PARAMS: Omit<
  ResponseCreateParamsNonStreaming,
  "input" | "text" | "stream"
> = {
  model: DEFAULT_RESPONSES_MODEL,
  reasoning: null,
};
