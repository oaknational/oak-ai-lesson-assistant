import type OpenAI from "openai";

import { executeGenericPromptAgent } from "../executeGenericPromptAgent";
import type { PlannerAgentProps } from "../types";
import { createPlannerAgent } from "./createPlannerAgent";

export const createOpenAIPlannerAgent =
  (openai: OpenAI) => (props: PlannerAgentProps) =>
    executeGenericPromptAgent({
      agent: createPlannerAgent(props),
      openai,
    });
