import type OpenAI from "openai";

import type { PlannerAgentProps } from "../../types";
import { executeGenericPromptAgent } from "../executeGenericPromptAgent";
import { createPlannerAgent } from "./createPlannerAgent";

export const createOpenAIPlannerAgent =
  (openai: OpenAI) => (props: PlannerAgentProps) =>
    executeGenericPromptAgent({
      agent: createPlannerAgent(props),
      openai,
    });
