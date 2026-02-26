import { aiLogger } from "@oakai/logger";

import moderationCategories from "./moderationCategories.json";
import oakServiceCategories from "./moderationCategoriesOakService.json";
import type { ModerationBase, ModerationResult } from "./moderationSchema";

const log = aiLogger("aila:moderation");

const allAilaCategories = moderationCategories.flatMap(
  (group) => group.categories,
);
const allOakServiceCategories = oakServiceCategories.flatMap(
  (group) => group.categories,
);

const allCategories = [...allAilaCategories, ...allOakServiceCategories];

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

function findCategory(slug: string) {
  return allCategories.find((c) => c.code === slug);
}

export function moderationGuidanceText(result: ModerationBase): string {
  const matched = result.categories
    .map((slug) => (typeof slug === "string" ? findCategory(slug) : undefined))
    .filter((c): c is (typeof allCategories)[number] => c !== undefined);

  const first = matched[0];
  if (
    matched.length === 1 &&
    first &&
    "longMessage" in first &&
    typeof first.longMessage === "string"
  ) {
    return first.longMessage;
  }

  const descriptions = matched.map(
    (c) =>
      ("shortMessage" in c ? c.shortMessage : undefined) ??
      ("userDescription" in c ? c.userDescription : undefined) ??
      "unknown category",
  );

  return `Contains ${descriptions.join(", ")}. Check content carefully.`;
}

export function getCategoryGroup(category: string) {
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
