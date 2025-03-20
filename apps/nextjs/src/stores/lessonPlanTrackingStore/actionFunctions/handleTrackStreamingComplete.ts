import { getLastAssistantMessage } from "@oakai/aila/src/helpers/chat/getLastAssistantMessage";
import { parseMessageParts } from "@oakai/aila/src/protocol/jsonPatchProtocol";
import { isToxic } from "@oakai/core/src/utils/ailaModeration/helpers";
import { aiLogger } from "@oakai/logger";

import * as Sentry from "@sentry/nextjs";
import invariant from "tiny-invariant";

import {
  isAccountLocked,
  isModeration,
  isPatch,
} from "@/components/AppComponents/Chat/chat-message/protocol";
import type { TrackFns } from "@/components/ContextProviders/AnalyticsProvider";
import {
  getLessonTrackingProps,
  getModerationTypes,
  isLessonComplete,
} from "@/lib/analytics/helpers";
import { ComponentType } from "@/lib/avo/Avo";
import type { GetStore } from "@/stores/AilaStoresProvider";

import type {
  LessonPlanTrackingGetter,
  LessonPlanTrackingSetter,
} from "../types";

const log = aiLogger("analytics:lesson:store");

export const handleTrackCompletion =
  (
    set: LessonPlanTrackingSetter,
    get: LessonPlanTrackingGetter,
    getStore: GetStore,
    track: TrackFns,
  ) =>
  () => {
    log.info("handleTrackCompletion");
    // Get values from this store
    const { id: chatId, currentMessage, lastLessonPlan } = get();
    if (!currentMessage) {
      log.error("analytics:lesson:store: No recorded action to track");
      Sentry.captureMessage("No recorded action to track");
      return;
    }

    // Get values from other stores
    const { streamingMessage, stableMessages: messages } = getStore("chat");
    invariant(!streamingMessage, "stableMessages isn't up to date");
    const { lessonPlan } = getStore("lessonPlan");

    const messageParts = getLastAssistantMessage(messages)?.parts;
    invariant(messageParts, "No assistant message found");
    const moderation = messageParts
      .map((part) => part.document)
      .find(isModeration);
    const isFirstMessage =
      messages.filter((message) => message.role === "user").length === 1;

    if (isFirstMessage) {
      /**
       * Lesson plan initiated: When the user starts a lesson plan
       */
      track.lessonPlanInitiated({
        ...getLessonTrackingProps({ lesson: lessonPlan }),
        chatId,
        moderatedContentType: getModerationTypes(moderation),
        text: currentMessage.text,
        componentType: currentMessage.componentType,
      });
    } else {
      /**
       * Lesson plan refined: a user message to the LLM such as an explicit instruction or "continue"
       */
      const patches = messageParts.map((p) => p.document).filter(isPatch);
      const isSelectingOakLesson = patches.some(
        (patch) => patch.value.path === "/basedOn",
      );
      const componentType = isSelectingOakLesson
        ? ComponentType.SELECT_OAK_LESSON
        : currentMessage.componentType;
      track.lessonPlanRefined({
        ...getLessonTrackingProps({ lesson: lessonPlan }),
        chatId,
        moderatedContentType: getModerationTypes(moderation),
        text: currentMessage.text,
        componentType,
        refinements: patches.map((patch) => ({
          refinementPath: patch.value.path,
          refinementType: patch.value.op,
        })),
      });
    }

    /**
     * Lesson plan completed: When the user finishes a lesson plan
     */
    const becameComplete =
      !isLessonComplete(lastLessonPlan) && isLessonComplete(lessonPlan);
    if (becameComplete) {
      track.lessonPlanCompleted({
        ...getLessonTrackingProps({ lesson: lessonPlan }),
        chatId,
        moderatedContentType: getModerationTypes(moderation),
      });
    }

    /**
     * Lesson plan terminated: When the user is blocked or the content is flagged toxic
     */
    const accountLocked = messageParts
      .map((p) => p.document)
      .some(isAccountLocked);
    const isTerminated = accountLocked || (moderation && isToxic(moderation)); // @todo: broken for toxic moderation
    if (isTerminated) {
      track.lessonPlanTerminated({
        chatId,
        isUserBlocked: accountLocked,
        isToxicContent: moderation ? isToxic(moderation) : false,
        isThreatDetected: false, // @fixme currently we can't access threat detection here
      });
    }
  };
