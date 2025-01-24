import invariant from "tiny-invariant";

import type { AilaStreamingStatus } from "..";
import { calculateStreamingStatus } from "../actions/calculateStreamingStatus";
import { getNextStableMessages, parseStreamingMessage } from "../parsing";
import type { AiMessage } from "../types";

// Add this import

export function handleSetMessages(set, get) {
  return (messages: AiMessage[], isLoading: boolean) => {
    let streamingStatus: AilaStreamingStatus = "Idle";

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
        ailaStreamingStatus: "Idle",
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

      streamingStatus = calculateStreamingStatus(
        currentMessageData,
        streamingStatus,
      );

      set({
        streamingMessage,
        ...(nextStableMessages && {
          stableMessages: nextStableMessages,
        }),
        ailaStreamingStatus: streamingStatus,
      });
    }
  };
}
