import { aiLogger } from "@oakai/logger";

import moderationCategories from "./moderationCategories.json";
import type { ModerationBase, ModerationResult } from "./moderationSchema";

const log = aiLogger("aila:moderation");
export function isToxic(result: ModerationBase): boolean {
  return result.categories.some((category) =>
    typeof category === "string" ? category.startsWith("t") : false,
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
  const category = moderationCategories.find(
    (category) => category.abbreviation === slug,
  );

  return category?.title ?? "Unknown category";
}

export function getCategoryGroup(category: string) {
  // With individual categories, we can determine the group from the prefix
  const prefix = category?.[0];
  if (!prefix) return null;
  
  const groupMap: { [key: string]: string } = {
    l: "Language and discrimination",
    u: "Upsetting, disturbing and sensitive",
    s: "Nudity and sex",
    p: "Physical activity and safety",
    e: "Education",
    r: "Recent content",
    n: "Not to be planned",
    t: "Toxic",
  };
  return groupMap[prefix] ?? null;
}

const MOCK_TOXIC_RESULT: ModerationResult = {
  categories: ["t4"],
  justification: "Mock toxic result",
};

const MOCK_SENSITIVE_RESULT: ModerationResult = {
  categories: ["l2"],
  justification: "Mock sensitive result",
};

export function getMockModerationResult(message?: string) {
  if (message?.includes("mod:tox")) {
    log.info("mod:tox detected, returning mock toxic result");
    return MOCK_TOXIC_RESULT;
  }
  if (message?.includes("mod:sen")) {
    log.info("mod:sen detected, returning mock sensitive result");
    return MOCK_SENSITIVE_RESULT;
  }
  return null;
}
