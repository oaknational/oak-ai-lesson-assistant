import type OpenAI from "openai";

import type { PresentationAgentProps } from "../../types";
import { executeGenericPromptAgent } from "../executeGenericPromptAgent";
import { createPresentationAgent } from "./createPresentationAgent";

export const createOpenAIPresentationAgent =
  (openai: OpenAI) => (props: PresentationAgentProps) =>
    executeGenericPromptAgent({
      agent: createPresentationAgent(props),
      openai,
    });
