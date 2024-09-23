import { useMemo, useEffect, useRef } from "react";

import { Message } from "ai";

export type AilaStreamingStatus =
  | "Loading"
  | "RequestMade"
  | "StreamingLessonPlan"
  | "StreamingChatResponse"
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
    const moderationStart = `MODERATION_START`;
    const chatStart = `CHAT_START`;
    if (messages.length === 0) return "Idle";
    const lastMessage = messages[messages.length - 1];

    if (isLoading) {
      if (!lastMessage) return "Loading";
      const { content } = lastMessage;
      if (lastMessage.role === "user") {
        return "RequestMade";
      } else if (content.includes(moderationStart)) {
        return "Moderating";
      } else if (
        content.includes(`"type":"prompt"`) ||
        content.includes(`\"type\":\"prompt\"`)
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
    console.log("ailaStreamingStatus set:", ailaStreamingStatus);
  }, [ailaStreamingStatus]);

  return ailaStreamingStatus;
};
