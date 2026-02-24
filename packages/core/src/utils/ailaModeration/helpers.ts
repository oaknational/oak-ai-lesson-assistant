import { aiLogger } from "@oakai/logger";

import moderationCategories from "./moderationCategories.json";
import oakServiceCategories from "./moderationCategoriesOakService.json";
import type { ModerationBase, ModerationResult } from "./moderationSchema";
import { oakModerationServiceCodes } from "./moderationSchema";

const log = aiLogger("aila:moderation");

const allAilaCategories = moderationCategories.flatMap(
  (group) => group.categories,
);
const allOakServiceCategories = oakServiceCategories.flatMap(
  (group) => group.categories,
);

/**
 * TODO: Remove this mapping in iteration 2 when the UI is updated
 * to display Oak Moderation Service category codes with their own descriptions.
 *
 * Temporary mapping from Oak Moderation Service codes to their closest
 * Aila moderator equivalents, for UI display only.
 * Codes with no good equivalent are omitted — they fall back to the
 * Oak category title instead.
 */
const oakToAilaCategoryMap: Record<string, string> = {
  "l/discriminatory-language": "l/discriminatory-behaviour",
  "l/offensive-language": "l/language-may-offend",
  "u/violence-or-suffering": "v/conflict-or-violence",
  "u/mental-health-challenges": "u/distressing-content",
  "u/crime-or-illegal-activities": "u/upsetting-content",
  "u/sexual-violence": "v/sexual-violence",
  "s/nudity-or-sexual-content": "s/nudity",
  "p/practical-activities": "p/equipment-safe-usage",
  "p/outdoor-learning": "p/physical-activity",
  "p/additional-qualifications": "p/external-content",
  "t/guides-self-harm-suicide": "t/guides-self-harm",
  "t/encourages-harmful-behaviour": "t/encouragement-harmful-behaviour",
  "t/encourages-illegal-activity": "t/encouragement-illegal-activity",
  "t/encourages-violence-harm-others": "t/encouragement-violence",
  "t/using-creating-harmful-substances": "t/creating-harmful-substances",
  // u/sensitive-content exists in both — no mapping needed
  // t/using-creating-weapons — no good v0 equivalent, falls back to Oak title
  // t/extreme-offensive-language — no good v0 equivalent, falls back to Oak title
  // r/, n/, e/ codes — no v0 equivalent, falls back to Oak title
};

export function isToxic(result: ModerationBase): boolean {
  return result.categories.some((category) =>
    typeof category === "string" ? category.startsWith("t/") : false,
  );
}

export function isGuidanceRequired(result: ModerationBase): boolean {
  return result.categories.length > 0;
}

export function isSafe(result: ModerationBase): boolean {
  return result.categories.length === 0;
}

export function getSafetyResult(
  result: ModerationBase,
): "safe" | "guidance-required" | "toxic" {
  if (isToxic(result)) {
    return "toxic";
  }

  if (isGuidanceRequired(result)) {
    return "guidance-required";
  }

  return "safe";
}

export function moderationSlugToDescription(
  slug: ModerationBase["categories"][number],
): string {
  if (typeof slug !== "string") {
    return "Unknown category";
  }

  const ailaCode = oakToAilaCategoryMap[slug];
  if (ailaCode) {
    return (
      allAilaCategories.find((c) => c.code === ailaCode)?.userDescription ??
      "Unknown category"
    );
  }

  return (
    allAilaCategories.find((c) => c.code === slug)?.userDescription ??
    allOakServiceCategories.find((c) => c.code === slug)?.title ??
    "Unknown category"
  );
}

export function getCategoryGroup(category: string) {
  const ailaCode = oakToAilaCategoryMap[category];
  if (ailaCode) {
    return (
      moderationCategories.find((group) =>
        group.categories.some((c) => c.code === ailaCode),
      ) ?? null
    );
  }

  return (
    moderationCategories.find((group) =>
      group.categories.some((c) => c.code === category),
    ) ??
    oakServiceCategories.find((group) =>
      group.categories.some((c) => c.code === category),
    ) ??
    null
  );
}

const MOCK_TOXIC_RESULT: ModerationResult = {
  categories: ["t/encouragement-violence"],
  justification: "Mock toxic result",
};

const MOCK_SENSITIVE_RESULT: ModerationResult = {
  categories: ["l/strong-language"],
  justification: "Mock sensitive result",
};

export function getMockModerationResult(
  message?: string,
): ModerationResult | null {
  if (message?.includes("mod:tox")) {
    log.info("mod:tox detected, returning mock toxic result");
    return MOCK_TOXIC_RESULT;
  }
  if (message?.includes("mod:sen")) {
    log.info("mod:sen detected, returning mock sensitive result");
    return MOCK_SENSITIVE_RESULT;
  }
  const catMatch = message?.match(/mod:cat:([\w/,-]+)/);
  if (catMatch?.[1]) {
    const codes = catMatch[1]
      .split(",")
      .filter((code) =>
        (oakModerationServiceCodes as readonly string[]).includes(code),
      );
    if (codes.length > 0) {
      log.info("mod:cat detected, returning mock result", { codes });
      return {
        categories: codes as ModerationResult["categories"],
      };
    }
  }
  return null;
}
