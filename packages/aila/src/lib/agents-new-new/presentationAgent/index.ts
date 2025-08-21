import type OpenAI from "openai";

import { executeGenericPromptAgent } from "../executeGenericPromptAgent";
import type { PresentationAgentProps } from "../types";
import { createPresentationAgent } from "./createPresentationAgent";

export const createOpenAIPresentationAgent =
  (openai: OpenAI) => (props: PresentationAgentProps) =>
    executeGenericPromptAgent({
      agent: createPresentationAgent(props),
      openai,
    });
