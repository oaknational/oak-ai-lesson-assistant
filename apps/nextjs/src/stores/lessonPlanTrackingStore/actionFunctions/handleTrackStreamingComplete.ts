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
  type UserAction,
  getLessonTrackingProps,
  getModerationTypes,
  isLessonComplete,
} from "@/lib/analytics/helpers";
import { ComponentType, type ComponentTypeValueType } from "@/lib/avo/Avo";
import type { GetStore } from "@/stores/AilaStoresProvider";

import type { LessonPlanGetter, LessonPlanSetter } from "../types";

const log = aiLogger("analytics:lesson:store");

function actionToComponentType(
  action: UserAction | null,
): ComponentTypeValueType {
  invariant(action, "actionToComponentType called with null action");
  switch (action) {
    case "button_continue":
      return ComponentType.CONTINUE_BUTTON;
    case "button_retry":
      return ComponentType.REGENERATE_RESPONSE_BUTTON;
    case "start_from_example":
      return ComponentType.EXAMPLE_LESSON_BUTTON;
    case "start_from_free_text":
      return ComponentType.TEXT_INPUT;
    case "submit_text":
      return ComponentType.TYPE_EDIT;
  }
}

export const handleTrackCompletion =
  (
    set: LessonPlanSetter,
    get: LessonPlanGetter,
    getStore: GetStore,
    track: TrackFns,
  ) =>
  () => {
    try {
      // Get values from this store
      const { id: chatId, userAction, userMessageContent } = get();
      if (!userMessageContent || !userAction) {
        log.error("No recorded action to track");
        Sentry.captureMessage("No recorded action to track");
        return;
      }

      // Get values from other stores
      const { streamingMessage, stableMessages: messages } = getStore("chat");
      invariant(streamingMessage, "stableMessages isn't up to date");
      invariant(messages, "stable messages is defined");
      const { lastLessonPlan, lessonPlan } = getStore("lessonPlan");

      const ailaMessageContent = getLastAssistantMessage(messages)?.content;
      if (!ailaMessageContent) {
        log.warn("No assistant message content found");
        return;
      }

      // Shared parts
      const messageParts = parseMessageParts(ailaMessageContent);
      const patches = messageParts.map((p) => p.document).filter(isPatch);
      const moderation = messageParts.map((p) => p.document).find(isModeration);
      const accountLocked = messageParts
        .map((p) => p.document)
        .some(isAccountLocked);
      const componentType = actionToComponentType(userAction);

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
          text: userMessageContent,
          componentType,
        });
      } else {
        /**
         * Lesson plan refined: a user message to the LLM such as an explicit instruction or "continue"
         */
        const isSelectingOakLesson = patches.some(
          (patch) => patch.value.path === "/basedOn",
        );
        track.lessonPlanRefined({
          ...getLessonTrackingProps({ lesson: lessonPlan }),
          chatId,
          moderatedContentType: getModerationTypes(moderation),
          text: userMessageContent,
          componentType: isSelectingOakLesson
            ? "select_oak_lesson"
            : componentType,
          refinements: patches.map((patch) => ({
            refinementPath: patch.value.path,
            refinementType: patch.value.op,
          })),
        });
      }

      /**
       * Lesson plan completed: When the user finishes a lesson plan
       */
      // TODO: confirm timings of lastLessonPlan.
      // TODO: store lastLessonPlan in the store
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
      const isTerminated = accountLocked || (moderation && isToxic(moderation)); // @todo: broken for toxic moderation
      if (isTerminated) {
        track.lessonPlanTerminated({
          chatId,
          isUserBlocked: accountLocked,
          isToxicContent: moderation ? isToxic(moderation) : false,
          isThreatDetected: false, // @fixme currently we can't access threat detection here
        });
      }
    } finally {
      set({
        userAction: null,
        userMessageContent: null,
      });
    }
  };
