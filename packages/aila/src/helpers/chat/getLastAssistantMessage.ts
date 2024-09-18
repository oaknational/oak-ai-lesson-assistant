import type { Message as AiMessage } from "ai";

import type { Message as AilaMessage } from "../../core/chat/types";

interface AssistantMessage extends AilaMessage {
  role: "assistant";
}

/**
 * This function takes an array of messages, and returns the last message from the assistant.
 * If the last message is not from the assistant, it synthesises an ID and reports an error.
 */
export function getLastAssistantMessage(
  messages: AiMessage[],
): AssistantMessage | undefined {
  const lastAssistantMessage = messages.findLast(
    (m): m is AssistantMessage => m.role === "assistant",
  );

  return lastAssistantMessage;
}
