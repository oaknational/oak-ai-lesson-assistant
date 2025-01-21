import invariant from "tiny-invariant";

import type { AilaStreamingStatus } from "..";
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

      // Determine streaming status
      if (!currentMessageData) {
        streamingStatus = "Loading";
      } else if (currentMessageData.role === "user") {
        streamingStatus = "RequestMade";
      } else if (currentMessageData.content.includes("MODERATION_START")) {
        streamingStatus = "Moderating";
      } else if (currentMessageData.content.includes("experimentalPatch")) {
        streamingStatus = "StreamingExperimentalPatches";
      } else if (
        currentMessageData.content.includes('"type":"prompt"') ||
        currentMessageData.content.includes('\\"type\\":\\"prompt\\"')
      ) {
        streamingStatus = "StreamingChatResponse";
      } else if (currentMessageData.content.includes("CHAT_START")) {
        streamingStatus = "StreamingLessonPlan";
      } else {
        streamingStatus = "Loading";
      }

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
