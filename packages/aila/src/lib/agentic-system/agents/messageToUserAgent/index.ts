import type OpenAI from "openai";

import type { MessageToUserAgentProps } from "../../types";
import { executeGenericPromptAgent } from "../executeGenericPromptAgent";
import { createMessageToUserAgent } from "./createMessageToUserAgent";

export const createOpenAIMessageToUserAgent =
  (openai: OpenAI) => (props: MessageToUserAgentProps) =>
    executeGenericPromptAgent({
      agent: createMessageToUserAgent(props),
      openai,
    });
