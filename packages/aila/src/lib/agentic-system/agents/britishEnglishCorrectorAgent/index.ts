import type OpenAI from "openai";

import type { AgentResult } from "../../types";
import {
  type GenerationCollector,
  executeGenericPromptAgent,
} from "../executeGenericPromptAgent";
import {
  type BritishEnglishCorrectorAgentProps,
  createBritishEnglishCorrectorAgent,
} from "./createBritishEnglishCorrectorAgent";

export type { BritishEnglishCorrectorAgentProps } from "./createBritishEnglishCorrectorAgent";

export const createOpenAIBritishEnglishCorrectorAgent =
  (openai: OpenAI, collectGeneration?: GenerationCollector) =>
  (props: BritishEnglishCorrectorAgentProps): Promise<AgentResult<unknown>> =>
    executeGenericPromptAgent({
      agent: createBritishEnglishCorrectorAgent(props),
      agentId: "britishEnglishCorrector",
      openai,
      collectGeneration,
      promptInputs: {
        sectionKey: props.sectionKey,
      },
    });
