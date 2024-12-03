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
    keyStageSlug: parseKeyStage(lesson.keyStage ?? ""),
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

const keyStageMap: Record<string, string> = {
  1: "ks1",
  2: "ks2",
  3: "ks3",
  4: "ks4",
  5: "ks5",
  keystage1: "ks1",
  keystage2: "ks2",
  keystage3: "ks3",
  keystage4: "ks4",
  keystage5: "ks5",
  eyfs: "early-years-foundation-stage",
};

export function parseKeyStage(maybeKeyStage: string): string {
  const strippedMaybeKeyStage = maybeKeyStage
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const keyStageSlug = keyStageMap[strippedMaybeKeyStage];

  return keyStageSlug ?? "unknown";
}
