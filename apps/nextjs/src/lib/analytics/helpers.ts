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

type KeyStage =
  | "ks1"
  | "ks2"
  | "ks3"
  | "ks4"
  | "ks5"
  | "early-years-foundation-stage";

/**
 * If a string starts with any of the keys in this map, it will be mapped to the
 * corresponding value.
 */
const startKeyStageMap: Record<string, KeyStage> = {
  ks1: "ks1",
  ks2: "ks2",
  ks3: "ks3",
  ks4: "ks4",
  ks5: "ks5",
  key_stage_1: "ks1",
  key_stage_2: "ks2",
  key_stage_3: "ks3",
  key_stage_4: "ks4",
  key_stage_5: "ks5",
  eyfs: "early-years-foundation-stage",
  early_years: "early-years-foundation-stage",
  foundation_stage: "early-years-foundation-stage",
  reception: "early-years-foundation-stage",
  sixth_form: "ks5",
  gcse: "ks4",
  a_level: "ks5",
  alevel: "ks5",
  year_2: "ks1",
  year_3: "ks2",
  year_4: "ks2",
  year_5: "ks2",
  year_6: "ks2",
  year_7: "ks3",
  year_8: "ks3",
  year_9: "ks3",
  year_10: "ks4",
  year_11: "ks4",
  year_12: "ks5",
  year_13: "ks5",
};

/**
 * If a string is an exact key in this map, it will be mapped to the corresponding value.
 */
const exactKeyStageMap: Record<string, KeyStage> = {
  year_1: "ks1",
  year_1_2: "ks1",
  "1_2": "ks1",
  // 1-5 assume keystage
  1: "ks1",
  2: "ks2",
  3: "ks3",
  4: "ks4",
  5: "ks5",
  // 6-13 assume year
  6: "ks2",
  7: "ks3",
  8: "ks3",
  9: "ks3",
  10: "ks4",
  11: "ks4",
  12: "ks5",
  13: "ks5",
};

export function parseKeyStage(maybeKeyStage: string): string {
  const strippedMaybeKeyStage = maybeKeyStage
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_");

  const exactMatch = exactKeyStageMap[strippedMaybeKeyStage];
  if (exactMatch) {
    return exactMatch;
  }

  let str = "";

  for (const char of strippedMaybeKeyStage) {
    str += char;
    const startMatch = startKeyStageMap[str];

    if (startMatch) {
      return startMatch;
    }
  }

  return maybeKeyStage;
}
