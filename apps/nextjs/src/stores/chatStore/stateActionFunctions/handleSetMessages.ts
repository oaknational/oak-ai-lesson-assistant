import invariant from "tiny-invariant";

import type { AilaStreamingStatus } from "..";
import { calculateStreamingStatus } from "../actions/calculateStreamingStatus";
import { getNextStableMessages, parseStreamingMessage } from "../parsing";
import type { ChatSetter, ChatGetter, AiMessage } from "../types";

export function handleSetMessages(set: ChatSetter, get: ChatGetter) {
  function handleChangedAilaStreamingStatus(
    ailaStreamingStatus: AilaStreamingStatus,
  ) {
    if (ailaStreamingStatus === "Idle" && get().queuedUserAction) {
      void get().executeQueuedAction();
    }
    if (ailaStreamingStatus === "Idle") {
      const { moderationActions } = get();
      invariant(moderationActions, "Passed into store in provider");
      void moderationActions.fetchModerations();
    }
  }

  function lastMessageIsUser(messages: AiMessage[]) {
    return messages[messages.length - 1]?.role === "user";
  }

  return (messages: AiMessage[], isLoading: boolean) => {
    const originalStreamingStatus = get().ailaStreamingStatus;

    if (!isLoading) {
      // The AI SDK isn't loading: we're idle and all messages are stable

      const nextStableMessages = getNextStableMessages(
        messages,
        get().stableMessages,
      );
      // NOTE: currently will update the store even if no value needs changing
      set({
        ...(nextStableMessages && {
          stableMessages: nextStableMessages,
        }),
        streamingMessage: null,
        ailaStreamingStatus: "Idle",
      });
    } else if (lastMessageIsUser(messages)) {
      // AI SDK is loading without a message from the API: we're waiting for a response

      const nextStableMessages = getNextStableMessages(
        messages,
        get().stableMessages,
      );
      set({
        ...(nextStableMessages && {
          stableMessages: nextStableMessages,
        }),
        streamingMessage: null,
        ailaStreamingStatus: "RequestMade",
      });
    } else {
      // AI SDK is loading with a message from the API: we're streaming

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
