import { useEffect, useState } from "react";

import { Message } from "ai";

import { LESSON_PLAN_SECTIONS } from "@/components/AppComponents/Chat/export-buttons/LessonPlanProgressDropdown";
import { useDemoUser } from "@/components/ContextProviders/Demo";

const stateLineHasAllSections = (line: string) => {
  if (!line.includes(`"type":"state"`)) {
    return false;
  }

  return LESSON_PLAN_SECTIONS.every((section) =>
    line.includes(`"${section.key}":`),
  );
};

export function useDemoLocking(messages: Message[], isLoading: boolean) {
  const demo = useDemoUser();

  const [firstCompleteResponse, setFirstCompleteResponse] =
    useState<Message | null>(null);

  useEffect(() => {
    if (
      !demo.isDemoUser ||
      // Don't calculate while the content is streaming
      isLoading ||
      // Don't calculate if we already know the first complete response
      firstCompleteResponse
    ) {
      return;
    }

    const message = messages.find(
      (m) =>
        m.role === "assistant" &&
        m.content.split("\n").find(stateLineHasAllSections),
    );
    if (message) {
      setFirstCompleteResponse(message);
    }
  }, [demo.isDemoUser, isLoading, messages, firstCompleteResponse]);

  if (!demo.isDemoUser) {
    return false;
  }

  if (!firstCompleteResponse) {
    return false;
  }

  const completeMessageIndex = messages.findIndex(
    (m) => m.id === firstCompleteResponse.id,
  );
  const userMessagesAfterComplete = messages.filter(
    (m, i) => i > completeMessageIndex && m.role === "user",
  ).length;

  return userMessagesAfterComplete >= 10;
}
