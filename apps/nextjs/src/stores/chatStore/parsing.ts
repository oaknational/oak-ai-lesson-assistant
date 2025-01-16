import { parseMessageParts } from "@oakai/aila/src/protocol/jsonPatchProtocol";
import { aiLogger } from "@oakai/logger";

import type { AiMessage, ParsedMessage } from "./types";

const log = aiLogger("chat:store");

const stableMessagesMatch = (
  messages: AiMessage[],
  stableMessages: AiMessage[],
) => {
  const idHash = (messages: AiMessage[]) => messages.map((m) => m.id).join(",");
  return idHash(messages) === idHash(stableMessages);
};

export const getNextStableMessages = (
  messages: AiMessage[],
  currentMessages: ParsedMessage[],
): ParsedMessage[] | null => {
  if (stableMessagesMatch(messages, currentMessages)) {
    log.info("Stable messages unchanged, not updating");
    return null;
  }
  return messages.map((m) => parseMessage(m));
};

export const parseStableMessages = (messages: AiMessage[]): ParsedMessage[] => {
  return messages.map((m) => parseMessage(m));
};

export const parseStreamingMessage = (
  message: AiMessage,
  previousIteration: ParsedMessage | null,
): ParsedMessage => {
  try {
    return parseMessage(message);
  } catch (e) {
    if (message.id === previousIteration?.id) {
      log.warn(
        "Failed to parse streaming message. Falling back to previous iteration",
        e,
      );
      return previousIteration;
    }
    throw e;
  }
};

export const parseMessage = (message: AiMessage): ParsedMessage => {
  const parts = parseMessageParts(message.content);

  return {
    ...message,
    parts,

    // Calculated fields
    hasError: parts.some((part) => part.document.type === "error"),
    isEditing:
      // TODO: this used to look at ailaStreamingStatus.
      // Our equivalent would be to only add it to a currentMessage
      parts.some((part) => part.isPartial) ||
      parts.filter((part) => ["bad", "text", "prompt"].includes(part.type))
        .length === 0,
  };
};
