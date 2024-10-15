import type { Message as AiMessage } from "ai";
import { findLast } from "remeda";

import type { Message as AilaMessage } from "../../core/chat/types";

interface AssistantMessage extends AilaMessage {
  role: "assistant";
}

/**
 * This function takes an array of messages, and returns the last message from the assistant.
 */
export function getLastAssistantMessage(
  messages: AiMessage[],
): AssistantMessage | undefined {
  const lastAssistantMessage = findLast(
    messages,
    (m): m is AssistantMessage => m.role === "assistant",
  ) as AssistantMessage | undefined;

  return lastAssistantMessage;
}
