import { parseMessageParts } from "@oakai/aila/src/protocol/jsonPatchProtocol";
import { LooseLessonPlan } from "@oakai/aila/src/protocol/schema";
import { isToxic } from "@oakai/core/src/utils/ailaModeration/helpers";
import * as Sentry from "@sentry/nextjs";

import {
  isPatch,
  isModeration,
  isAccountLocked,
} from "@/components/AppComponents/Chat/chat-message/protocol";
import { TrackFns } from "@/components/ContextProviders/AnalyticsProvider";

import { ComponentType, ComponentTypeValueType } from "../avo/Avo";
import {
  UserAction,
  getLessonTrackingProps,
  getModerationTypes,
  isLessonComplete,
} from "./helpers";

function actionToComponentType(
  action: UserAction | null,
): ComponentTypeValueType {
  if (!action) {
    Sentry.captureMessage("actionToComponentType called with null action");
    return "" as ComponentTypeValueType;
  }
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

/**
 * This function is responsible for sending the appropriate tracking event any
 * time there is an update to the lesson plan. Even if the user has not made any
 * changes, we still need to track the lesson plan as it progresses.
 */
export function trackLessonPlanRefined({
  prevLesson,
  nextLesson,
  userMessageContent,
  ailaMessageContent,
  isFirstMessage,
  track,
  action,
}: {
  prevLesson: LooseLessonPlan;
  nextLesson: LooseLessonPlan;
  userMessageContent: string;
  ailaMessageContent: string;
  isFirstMessage: boolean;
  track: TrackFns;
  action: UserAction | null;
}) {
  const messageParts = parseMessageParts(ailaMessageContent);
  const patches = messageParts.filter(isPatch);
  const moderation = messageParts.find(isModeration);
  const accountLocked = messageParts.some(isAccountLocked);
  const componentType = actionToComponentType(action);

  /**
   * Lesson plan initiated: When the user starts a lesson plan
   */
  if (isFirstMessage) {
    track.lessonPlanInitiated({
      ...getLessonTrackingProps({ lesson: nextLesson }),
      moderatedContentType: getModerationTypes(moderation),
      text: userMessageContent,
      componentType,
    });
  }
  /**
   * Lesson plan refined: a round of refinements (even if there are no changes)
   */
  if (!isFirstMessage) {
    const isSelectingOakLesson = patches.some(
      (patch) => patch.value.path === "/basedOn",
    );
    track.lessonPlanRefined({
      ...getLessonTrackingProps({ lesson: nextLesson }),
      moderatedContentType: getModerationTypes(moderation),
      text: userMessageContent,
      componentType: isSelectingOakLesson ? "select_oak_lesson" : componentType,
      refinements: patches.map((patch) => ({
        refinementPath: patch.value.path,
        refinementType: patch.value.op,
      })),
    });
  }
  /**
   * Lesson plan completed: When the user finishes a lesson plan
   */
  if (!isLessonComplete(prevLesson) && isLessonComplete(nextLesson)) {
    track.lessonPlanCompleted({
      ...getLessonTrackingProps({ lesson: nextLesson }),
      moderatedContentType: getModerationTypes(moderation),
    });
  }
  /**
   * Lesson plan terminated: When the user is blocked or the content is flagged toxic
   */
  const isTerminated = accountLocked || (moderation && isToxic(moderation));
  if (isTerminated) {
    track.lessonPlanTerminated({
      isUserBlocked: accountLocked,
      isToxicContent: moderation ? isToxic(moderation) : false,
      isThreatDetected: false, // @fixme currently we can't access threat detection here
    });
  }
}
