import { useMemo, useEffect } from "react";

import type { LessonPlanKeys } from "@oakai/aila/src/protocol/schema";
import { LessonPlanKeysSchema } from "@oakai/aila/src/protocol/schema";
import { aiLogger } from "@oakai/logger";
import type { Message } from "ai";

const log = aiLogger("chat");

function findStreamingSections(message: Message | undefined): {
  streamingSections: LessonPlanKeys[];
  streamingSection: LessonPlanKeys | undefined;
  content: string | undefined;
} {
  if (!message?.content) {
    return {
      streamingSections: [],
      streamingSection: undefined,
      content: undefined,
    };
  }
  const { content } = message;
  const pathMatches: RegExpExecArray[] = [];
  let match: RegExpExecArray | null;
  while ((match = /"path":"\/([^/"]*)(?:\/|")/g.exec(content)) !== null) {
    pathMatches.push(match);
  }

  const streamingSections: LessonPlanKeys[] = pathMatches
    .map((match) => match[1])
    .filter((i): i is string => typeof i === "string")
    .map((section) => {
      const result = LessonPlanKeysSchema.safeParse(section);
      return result.success ? result.data : undefined;
    })
    .filter((section): section is LessonPlanKeys => section !== undefined);
  const streamingSection: LessonPlanKeys | undefined =
    streamingSections[streamingSections.length - 1];

  return { streamingSections, streamingSection, content };
}

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
    const { streamingSections, streamingSection, content } =
      findStreamingSections(lastMessage);

    if (isLoading) {
      if (!lastMessage || !content) {
        status = "Loading";
      } else {
        if (lastMessage.role === "user") {
          status = "RequestMade";
        } else if (content.includes(moderationStart)) {
          status = "Moderating";
        } else if (content.includes(`"type":"text"`)) {
          status = "StreamingChatResponse";
        } else if (content.includes(chatStart)) {
          status = "StreamingLessonPlan";
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
