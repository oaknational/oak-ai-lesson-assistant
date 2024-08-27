import { useMemo } from "react";

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
  const possibleTypePatch = `"type":"patch"`;
  const possibleTypePrompt = `"type":"prompt"`;

  const ailaStreamingStatus = useMemo<AilaStreamingStatus>(() => {
    const lastMessage = messages[messages.length - 1];
    const contentSplitByRs = lastMessage?.content.split("␞");
    const lastSectionOfStreamingContent = contentSplitByRs
      ? contentSplitByRs[contentSplitByRs?.length - 1]
      : "";
    if (isLoading) {
      if (!lastMessage) return "Loading";
      if (lastMessage.role === "user") {
        return "RequestMade";
      } else if (
        lastMessage.role === "assistant" &&
        lastSectionOfStreamingContent?.includes(possibleTypePatch)
      ) {
        return "StreamingLessonPlan";
      } else if (
        lastMessage.content.includes(possibleTypePatch) &&
        lastMessage.content.includes(possibleTypePrompt) &&
        lastSectionOfStreamingContent !== ""
      ) {
        return "StreamingChatResponse";
      } else if (
        lastMessage.content.includes(possibleTypePatch) &&
        lastMessage.content.includes(possibleTypePrompt) &&
        lastSectionOfStreamingContent === ""
      ) {
        return "Moderating";
      }
      return "Loading";
    }
    return "Idle";
  }, [isLoading, messages, possibleTypePatch, possibleTypePrompt]);

  // @todo lets build a logger
  if (process.env.NODE_ENV !== "development") {
    console.log("ailaStreamingStatus", ailaStreamingStatus);
  }

  return ailaStreamingStatus;
};
