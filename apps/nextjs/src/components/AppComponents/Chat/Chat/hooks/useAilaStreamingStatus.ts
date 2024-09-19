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
  const prevStatusRef = useRef<AilaStreamingStatus | null>(null);

  const possibleTypePatch = `"type":"patch"`;
  const possibleTypePrompt = `"type":"prompt"`;
  const possibleTypeModeration = `STARTING_MODERATION`;

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
      } else if (lastMessage.content.includes(possibleTypeModeration)) {
        return "Moderating";
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
      }
      return "Loading";
    }
    return "Idle";
  }, [
    isLoading,
    messages,
    possibleTypeModeration,
    possibleTypePatch,
    possibleTypePrompt,
  ]);

  useEffect(() => {
    if (prevStatusRef.current !== ailaStreamingStatus) {
      console.log("ailaStreamingStatus changed:", ailaStreamingStatus);
      prevStatusRef.current = ailaStreamingStatus;
    }
  }, [ailaStreamingStatus]);

  return ailaStreamingStatus;
};
