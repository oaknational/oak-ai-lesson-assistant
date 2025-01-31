import invariant from "tiny-invariant";

import type { AilaStreamingStatus, ChatStore } from "..";
import { calculateStreamingStatus } from "../actions/calculateStreamingStatus";
import { getNextStableMessages, parseStreamingMessage } from "../parsing";
import type { AiMessage } from "../types";

export function handleSetMessages(
  set: (partial: Partial<ChatStore>) => void,
  get: () => ChatStore,
) {
  function handleChangedAilaStreamingStatus(
    ailaStreamingStatus: AilaStreamingStatus,
  ) {
    const { id } = get();
    if (ailaStreamingStatus === "Idle" && get().queuedUserAction) {
      void get().executeQueuedAction();
    }
    if (ailaStreamingStatus === "Idle" && id) {
      const { moderationActions } = get();
      invariant(moderationActions, "Passed into store in provider");
      void moderationActions.fetchModerations(id);
    }
  }

  return (messages: AiMessage[], isLoading: boolean) => {
    const originalStreamingStatus = get().ailaStreamingStatus;

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

      set({
        streamingMessage,
        ...(nextStableMessages && {
          stableMessages: nextStableMessages,
        }),
        ailaStreamingStatus: calculateStreamingStatus(currentMessageData),
      });
    }

    const streamingStatusChanged =
      get().ailaStreamingStatus !== originalStreamingStatus;
    if (streamingStatusChanged) {
      handleChangedAilaStreamingStatus(get().ailaStreamingStatus);
    }
  };
}
