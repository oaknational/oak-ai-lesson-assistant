import { useMemo, useEffect } from "react";

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
}): {
  status: AilaStreamingStatus;
  streamingSection: string | undefined;
  streamingSections: string[] | undefined;
} => {
  const { status, streamingSection, streamingSections } = useMemo(() => {
    const moderationStart = `MODERATION_START`;
    const chatStart = `CHAT_START`;
    if (messages.length === 0)
      return {
        status: "Idle" as AilaStreamingStatus,
        streamingSection: undefined,
      };
    const lastMessage = messages[messages.length - 1];

    let status: AilaStreamingStatus = "Idle";
    let streamingSection: string | undefined = undefined;
    let streamingSections: string[] = [];

    if (isLoading) {
      if (!lastMessage) {
        status = "Loading";
      } else {
        const { content } = lastMessage;
        if (lastMessage.role === "user") {
          status = "RequestMade";
        } else if (content.includes(moderationStart)) {
          status = "Moderating";
        } else if (content.includes(`"type":"text"`)) {
          status = "StreamingChatResponse";
        } else if (content.includes(chatStart)) {
          status = "StreamingLessonPlan";
          // Extract the slug of the currently streaming section, if there is one
          const pathMatches = [
            ...content.matchAll(/"path":"\/([^/"]*)(?:\/|")/g),
          ];
          console.log("Path matches", pathMatches);
          streamingSections = pathMatches
            .map((match) => match[1])
            .filter((i): i is string => i !== undefined);
          console.log("Streaming sections", streamingSections);
          const lastMatch = pathMatches[pathMatches.length - 1];
          streamingSection = lastMatch ? lastMatch[1] : undefined;
        } else {
          status = "Loading";
        }
      }
    }

    return { status, streamingSections, streamingSection };
  }, [isLoading, messages]);

  useEffect(() => {
    console.log("ailaStreamingStatus set:", status);
    if (streamingSection) {
      console.log("streamingSection:", streamingSection);
    }
  }, [status, streamingSection]);

  return { status, streamingSection, streamingSections };
};
