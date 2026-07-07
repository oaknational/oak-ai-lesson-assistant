import type OpenAI from "openai";

import type { MessageToUserAgentProps } from "../../types";
import {
  type GenerationCollector,
  executeGenericPromptAgent,
} from "../executeGenericPromptAgent";
import { createMessageToUserAgent } from "./createMessageToUserAgent";

export const createOpenAIMessageToUserAgent =
  (openai: OpenAI, collectGeneration?: GenerationCollector) =>
  (props: MessageToUserAgentProps) =>
    executeGenericPromptAgent({
      agent: createMessageToUserAgent(props),
      agentId: "messageToUser",
      openai,
      collectGeneration,
    });
