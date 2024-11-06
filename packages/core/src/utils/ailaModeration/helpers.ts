import { aiLogger } from "@oakai/logger";

import moderationCategories from "./moderationCategories.json";
import type { ModerationBase, ModerationResult } from "./moderationSchema";

const log = aiLogger("aila:moderation");
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
  const allCategories = moderationCategories.flatMap(
    (category) => category.categories,
  );

  return (
    allCategories.find((category) => category.code === slug)?.userDescription ??
    "Unknown category"
  );
}

export function getCategoryGroup(category: string) {
  return (
    moderationCategories.find((group) =>
      group.categories.some((c) => c.code === category),
    ) || null
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
