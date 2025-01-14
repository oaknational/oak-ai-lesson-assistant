import { useMemo } from "react";

import { useChatStore } from "store/useChatStores";

import type { AilaStreamingStatus } from "@/components/AppComponents/Chat/Chat/hooks/useAilaStreamingStatus";

export const useStreamingStatus = () => {
  const { isLoading, messages } = useChatStore();

  return useMemo<AilaStreamingStatus>(() => {
    const moderationStart = "MODERATION_START";
    const chatStart = "CHAT_START";

    if (messages.length === 0) return "Idle";
    const lastMessage = messages[messages.length - 1];

    if (isLoading) {
      if (!lastMessage) return "Loading";
      const { content } = lastMessage;

      if (lastMessage.role === "user") return "RequestMade";
      if (content.includes(moderationStart)) return "Moderating";
      if (content.includes("experimentalPatch"))
        return "StreamingExperimentalPatches";
      if (
        content.includes('"type":"prompt"') ||
        content.includes('\\"type\\":\\"prompt\\"')
      ) {
        return "StreamingChatResponse";
      }
      if (content.includes(chatStart)) return "StreamingLessonPlan";

      return "Loading";
    }

    return "Idle";
  }, [isLoading, messages]);
};
