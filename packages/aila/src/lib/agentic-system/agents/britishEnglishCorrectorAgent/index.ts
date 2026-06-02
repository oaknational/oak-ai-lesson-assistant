import type OpenAI from "openai";

import type { AgentResult } from "../../types";
import { executeGenericPromptAgent } from "../executeGenericPromptAgent";
import {
  type BritishEnglishCorrectorAgentProps,
  createBritishEnglishCorrectorAgent,
} from "./createBritishEnglishCorrectorAgent";

export type { BritishEnglishCorrectorAgentProps } from "./createBritishEnglishCorrectorAgent";

export const createOpenAIBritishEnglishCorrectorAgent =
  (openai: OpenAI) =>
  (props: BritishEnglishCorrectorAgentProps): Promise<AgentResult<unknown>> =>
    executeGenericPromptAgent({
      agent: createBritishEnglishCorrectorAgent(props),
      openai,
    });
