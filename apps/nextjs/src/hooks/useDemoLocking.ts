import { useMemo } from "react";

import {
  applyLessonPlanPatchImmutable,
  extractPatches,
} from "@oakai/aila/src/protocol/jsonPatchProtocol";
import type { PartialLessonPlan } from "@oakai/aila/src/protocol/schema";
import { aiLogger } from "@oakai/logger";

import { useDemoUser } from "@/components/ContextProviders/Demo";
import { isLessonComplete } from "@/lib/analytics/helpers";
import { useChatStore } from "@/stores/AilaStoresProvider";
import type { AiMessage } from "@/stores/chatStore";

if (!process.env.NEXT_PUBLIC_DEMO_MESSAGES_AFTER_COMPLETE) {
  throw new Error("NEXT_PUBLIC_DEMO_MESSAGES_AFTER_COMPLETE is not set");
}
const DEMO_MESSAGES_AFTER_COMPLETE = parseInt(
  process.env.NEXT_PUBLIC_DEMO_MESSAGES_AFTER_COMPLETE,
  10,
);

const log = aiLogger("demo");

export function replayLessonPlanFromMessages(
  messages: AiMessage[],
): PartialLessonPlan {
  let accumulatedLessonPlan: PartialLessonPlan = {};

  for (const message of messages) {
    if (message.role !== "assistant") {
      continue;
    }

    const { validPatches } = extractPatches(message.content);

    for (const patch of validPatches) {
      const updated = applyLessonPlanPatchImmutable(
        accumulatedLessonPlan,
        patch,
      );
      if (updated) {
        accumulatedLessonPlan = updated;
        log.info("Applied patch", patch.value.path);
      } else {
        log.info("Patch failed to apply", patch.value.path);
      }
    }
  }

  return accumulatedLessonPlan;
}

/**
 * Finds the first assistant message where the lesson plan becomes complete.
 * Returns the message object or null if no completion occurred.
 */
export function findFirstCompleteAssistantMessage(
  messages: AiMessage[],
  isComplete: (lesson: PartialLessonPlan) => boolean,
): AiMessage | null {
  let accumulatedLessonPlan: PartialLessonPlan = {};
  let wasComplete = false;

  for (const message of messages) {
    if (message.role !== "assistant") {
      continue;
    }

    const { validPatches } = extractPatches(message.content);

    for (const patch of validPatches) {
      const updated = applyLessonPlanPatchImmutable(
        accumulatedLessonPlan,
        patch,
      );
      if (updated) {
        accumulatedLessonPlan = updated;
      }
    }

    const isNowComplete = isComplete(accumulatedLessonPlan);

    // Completeness flipped from false to true at this message
    if (!wasComplete && isNowComplete) {
      return message;
    }

    wasComplete = isNowComplete;
  }

  return null;
}

/**
 * Demo users are allowed to make N edits to the lesson plan once all sections
 * are complete, where N is NEXT_PUBLIC_DEMO_MESSAGES_AFTER_COMPLETE.
 *
 * Completeness is determined by replaying patches from stable messages in order
 * and checking when isLessonComplete flips to true for the first time.
 */
export function useDemoLocking() {
  const demo = useDemoUser();
  const stableMessages = useChatStore((state) => state.stableMessages);

  if (!demo.isDemoUser) {
    return false;
  }

  // Find the first assistant message where completeness flips from false to true
  const firstCompleteMessage = useMemo(
    () => findFirstCompleteAssistantMessage(stableMessages, isLessonComplete),
    [stableMessages],
  );

  if (!firstCompleteMessage) {
    return false;
  }

  // Count user messages after the completion point
  const completeMessageIndex = stableMessages.findIndex(
    (m) => m.id === firstCompleteMessage.id,
  );
  const userMessagesAfterComplete = stableMessages.filter(
    (m, i) => i > completeMessageIndex && m.role === "user",
  ).length;

  return userMessagesAfterComplete >= DEMO_MESSAGES_AFTER_COMPLETE;
}
