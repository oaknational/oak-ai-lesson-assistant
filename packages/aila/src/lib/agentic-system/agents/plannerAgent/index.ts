import type OpenAI from "openai";

import type { PlannerAgentProps } from "../../types";
import {
  type GenerationCollector,
  executeGenericPromptAgent,
} from "../executeGenericPromptAgent";
import { createPlannerAgent } from "./createPlannerAgent";

export const createOpenAIPlannerAgent =
  (openai: OpenAI, collectGeneration?: GenerationCollector) =>
  (props: PlannerAgentProps) =>
    executeGenericPromptAgent({
      agent: createPlannerAgent(props),
      openai,
      collectGeneration,
    });
