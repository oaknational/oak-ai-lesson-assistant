import { useMemo, useEffect } from "react";

import {
  ValidLessonPlanKeys,
  type LessonPlanKeys,
} from "@oakai/aila/src/protocol/schema";
import { aiLogger } from "@oakai/logger";
import type { Message } from "ai";

const log = aiLogger("chat");

function findStreamingSections(messageContent: string): {
  streamingSections: LessonPlanKeys[];
  streamingSection: LessonPlanKeys | undefined;
} {
  const regex = /"path":"\/([^/"]*)/g;
  const pathMatches =
    messageContent
      .match(regex)
      ?.map((match) => match.replace(/"path":"\//, "").replace(/"$/, "")) ?? [];

  const streamingSections: LessonPlanKeys[] = pathMatches.filter((i) =>
    ValidLessonPlanKeys.includes(i),
  ) as LessonPlanKeys[];
  const streamingSection: LessonPlanKeys | undefined =
    streamingSections[streamingSections.length - 1];
  log.info("streamingSections", streamingSections);
  log.info("streamingSection", streamingSection);
  return { streamingSections, streamingSection };
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
      };
    const lastMessage = messages[messages.length - 1];

    if (!isLoading) {
      return { status: "Idle" as AilaStreamingStatus };
    }

    if (!lastMessage || !lastMessage.content) {
      return { status: "Loading" as AilaStreamingStatus };
    }

    if (lastMessage.role === "user") {
      return { status: "RequestMade" as AilaStreamingStatus };
    }

    const { content } = lastMessage;

    if (content.includes(moderationStart)) {
      return { status: "Moderating" as AilaStreamingStatus };
    }

    if (content.includes(`"type":"text"`)) {
      return { status: "StreamingChatResponse" as AilaStreamingStatus };
    }

    if (content.includes(chatStart)) {
      const { streamingSections, streamingSection } =
        findStreamingSections(content);
      return {
        status: "StreamingLessonPlan" as AilaStreamingStatus,
        streamingSections,
        streamingSection,
      };
    }

    return { status: "Loading" as AilaStreamingStatus };
  }, [isLoading, messages]);

  useEffect(() => {
    log.info("ailaStreamingStatus set:", status);
  }, [status]);

  return { status, streamingSection, streamingSections };
};
