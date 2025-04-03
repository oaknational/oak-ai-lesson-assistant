import type { ModerationDocument } from "@oakai/aila/src/protocol/jsonPatchProtocol";
import type { LooseLessonPlan } from "@oakai/aila/src/protocol/schema";
import { parseKeyStage } from "@oakai/core/src/data/parseKeyStage";
import { lessonPlanSectionsSchema } from "@oakai/exports/src/schema/input.schema";

import { isTruthy } from "remeda";

import type {
  ModeratedContentTypeValueType,
  ProductValueType,
} from "../avo/Avo";
import { ModeratedContentType } from "../avo/Avo";

export type LessonTrackingProps = {
  product: ProductValueType;
  lessonPlanTitle: string;
  subjectSlug: string;
  keyStageSlug: string;
};

export function getLessonTrackingProps({
  lesson,
}: {
  lesson: LooseLessonPlan;
}): LessonTrackingProps {
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
