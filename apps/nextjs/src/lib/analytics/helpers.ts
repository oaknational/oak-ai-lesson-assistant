import type { ModerationDocument } from "@oakai/aila/src/protocol/jsonPatchProtocol";
import type { LooseLessonPlan } from "@oakai/aila/src/protocol/schema";
import { lessonPlanSectionsSchema } from "@oakai/exports/src/schema/input.schema";
import { isTruthy } from "remeda";

import type {
  ModeratedContentTypeValueType,
  ProductValueType,
} from "../avo/Avo";
import { ModeratedContentType } from "../avo/Avo";

/**
 * These are the actions which a user could take which result in a message
 * being sent as part of the lesson plan generation.
 */
export type UserAction =
  | "start_from_example"
  | "start_from_free_text"
  | "button_continue"
  | "button_retry"
  | "submit_text";

export function getLessonTrackingProps({
  lesson,
}: {
  lesson: LooseLessonPlan;
}): {
  product: ProductValueType;
  lessonPlanTitle: string;
  subjectSlug: string;
  keyStageSlug: string;
} {
  return {
    product: "ai lesson assistant",
    lessonPlanTitle: lesson.title ?? "",
    subjectSlug: lesson.subject ?? "",
    keyStageSlug: lesson.keyStage ?? "",
  };
}

export function isLessonComplete(lesson: LooseLessonPlan) {
  return lessonPlanSectionsSchema.safeParse(lesson).success;
}

export function getModerationTypes(
  moderation?: ModerationDocument,
): ModeratedContentTypeValueType[] | null {
  if (!moderation) {
    return null;
  }
  return moderation.categories
    .map((category) => {
      if (category.startsWith("l/")) {
        return ModeratedContentType.LANGUAGE_AND_DISCRIMINATION;
      }
      if (category.startsWith("v/")) {
        return ModeratedContentType.VIOLENCE_AND_CRIME;
      }
      if (category.startsWith("u/")) {
        return ModeratedContentType.UPSETTING_DISTURBING_SENSITIVE;
      }
      if (category.startsWith("s/")) {
        return ModeratedContentType.NUDITY_AND_SEX;
      }
      if (category.startsWith("p/")) {
        return ModeratedContentType.PHYSICAL_SAFETY;
      }
      if (category.startsWith("t/")) {
        return ModeratedContentType.TOXIC;
      }
    })
    .filter(isTruthy);
}
