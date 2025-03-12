import { useEffect, useState } from "react";

import type { LessonPlanKey } from "@oakai/aila/src/protocol/schema";

import type { Message } from "ai";

import { useDemoUser } from "@/components/ContextProviders/Demo";
import { useChatStore } from "@/stores/AilaStoresProvider";

const KEYS_TO_COMPLETE = [
  "title",
  "subject",
  "keyStage",
  "learningOutcome",
  "learningCycles",
  "priorKnowledge",
  "keyLearningPoints",
  "misconceptions",
  "keywords",
  "starterQuiz",
  "cycle1",
  "cycle2",
  "cycle3",
  "exitQuiz",
] satisfies LessonPlanKey[];

if (!process.env.NEXT_PUBLIC_DEMO_MESSAGES_AFTER_COMPLETE) {
  throw new Error("NEXT_PUBLIC_DEMO_MESSAGES_AFTER_COMPLETE is not set");
}
const DEMO_MESSAGES_AFTER_COMPLETE = parseInt(
  process.env.NEXT_PUBLIC_DEMO_MESSAGES_AFTER_COMPLETE,
  10,
);

const stateLineHasAllSections = (line: string) => {
  if (!line.includes('"type":"state"')) {
    return false;
  }

  return KEYS_TO_COMPLETE.every((key) => line.includes(`"${key}":`));
};

/**
 * Demo users are allowed to make 10 edits to the lesson plan once all sections are complete
 */
export function useDemoLocking() {
  const isLoading = useChatStore((state) => state.ailaStreamingStatus);
  const stableMessages = useChatStore((state) => state.stableMessages);
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

    const message = stableMessages.find(
      (m) =>
        m.role === "assistant" &&
        m.content.split("\n").find(stateLineHasAllSections),
    );
    if (message) {
      setFirstCompleteResponse(message);
    }
  }, [demo.isDemoUser, isLoading, stableMessages, firstCompleteResponse]);

  if (!demo.isDemoUser) {
    return false;
  }

  if (!firstCompleteResponse) {
    return false;
  }

  const completeMessageIndex = stableMessages.findIndex(
    (m) => m.id === firstCompleteResponse.id,
  );
  const userMessagesAfterComplete = stableMessages.filter(
    (m, i) => i > completeMessageIndex && m.role === "user",
  ).length;

  return userMessagesAfterComplete >= DEMO_MESSAGES_AFTER_COMPLETE;
}
