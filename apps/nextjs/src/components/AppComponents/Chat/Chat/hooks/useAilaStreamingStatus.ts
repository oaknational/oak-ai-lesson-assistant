import { useMemo, useEffect } from "react";

import { aiLogger } from "@oakai/logger";
import type { Message } from "ai";

const log = aiLogger("chat");

export type AilaStreamingStatus =
  | "Loading"
  | "RequestMade"
  | "StreamingLessonPlan"
  | "StreamingChatResponse"
  | "StreamingExperimentalPatches"
  | "Moderating"
  | "Idle";
export const useAilaStreamingStatus = ({
  isLoading,
  messages,
}: {
  isLoading: boolean;
  messages: Message[];
}): AilaStreamingStatus => {
  const ailaStreamingStatus = useMemo<AilaStreamingStatus>(() => {
    const moderationStart = "MODERATION_START";
    const chatStart = "CHAT_START";
    if (messages.length === 0) return "Idle";
    const lastMessage = messages[messages.length - 1];

    if (isLoading) {
      if (!lastMessage) return "Loading";
      const { content } = lastMessage;
      if (lastMessage.role === "user") {
        return "RequestMade";
      } else if (content.includes(moderationStart)) {
        return "Moderating";
      } else if (content.includes("experimentalPatch")) {
        return "StreamingExperimentalPatches";
      } else if (
        content.includes('"type":"prompt"') ||
        content.includes('\\"type\\":\\"prompt\\"')
      ) {
        return "StreamingChatResponse";
      } else if (content.includes(chatStart)) {
        return "StreamingLessonPlan";
      }
      return "Loading";
    }
    return "Idle";
  }, [isLoading, messages]);

  useEffect(() => {
    log.info("ailaStreamingStatus set:", ailaStreamingStatus);
  }, [ailaStreamingStatus]);

  return ailaStreamingStatus;
};
