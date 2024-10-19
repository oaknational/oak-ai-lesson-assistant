import { useMemo, useEffect } from "react";

import {
  LessonPlanKeys,
  LessonPlanKeysSchema,
} from "@oakai/aila/src/protocol/schema";
import { aiLogger } from "@oakai/logger";
import { Message } from "ai";

const log = aiLogger("chat");

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
  streamingSection: LessonPlanKeys | undefined;
  streamingSections: LessonPlanKeys[] | undefined;
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
    let streamingSection: LessonPlanKeys | undefined = undefined;
    let streamingSections: LessonPlanKeys[] = [];

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
          streamingSections = pathMatches
            .map((match) => match[1])
            .filter(
              (i): i is LessonPlanKeys =>
                LessonPlanKeysSchema.safeParse(i).success,
            );
          const lastMatch = pathMatches[pathMatches.length - 1];
          streamingSection = lastMatch
            ? LessonPlanKeysSchema.safeParse(lastMatch[1]).success
              ? (lastMatch[1] as LessonPlanKeys)
              : undefined
            : undefined;
        } else {
          status = "Loading";
        }
      }
    }

    return { status, streamingSections, streamingSection };
  }, [isLoading, messages]);

  useEffect(() => {
    log.info("ailaStreamingStatus set:", status);
  }, [status]);

  return { status, streamingSection, streamingSections };
};
