import invariant from "tiny-invariant";

import { getNextStableMessages, parseStreamingMessage } from "../parsing";
import type { AiMessage } from "../types";

export function handleSetMessages(set, get) {
  return (messages: AiMessage[], isLoading: boolean) => {
    if (!isLoading) {
      const nextStableMessages = getNextStableMessages(
        messages,
        get().stableMessages,
      );
      set({
        ...(nextStableMessages && {
          stableMessages: nextStableMessages,
        }),
        streamingMessage: null,
      });
    } else {
      const currentMessageData = messages[messages.length - 1];
      invariant(currentMessageData, "Should have at least one message");
      const streamingMessage = parseStreamingMessage(
        currentMessageData,
        get().streamingMessage,
      );

      const stableMessageData = messages.slice(0, messages.length - 1);
      const nextStableMessages = getNextStableMessages(
        stableMessageData,
        get().stableMessages,
      );

      set({
        streamingMessage,
        ...(nextStableMessages && {
          stableMessages: nextStableMessages,
        }),
      });
    }
  };
}
