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

export function isToxic(result: ModerationBase): boolean {
  return result.categories.some((category) =>
    typeof category === "string" ? category.startsWith("t/") : false,
  );
}

export function isHighlySensitive(result: ModerationBase): boolean {
  return result.categories.some((category) =>
    typeof category === "string" ? category.startsWith("n/") : false,
  );
}

export function isGuidanceRequired(result: ModerationBase): boolean {
  return result.categories.length > 0;
}

export function isSafe(result: ModerationBase): boolean {
  return result.categories.length === 0;
}

export type SafetyResult =
  | "safe"
  | "guidance-required"
  | "highly-sensitive"
  | "toxic";

export function getSafetyResult(result: ModerationBase): SafetyResult {
  if (isToxic(result)) {
    return "toxic";
  }

  if (isHighlySensitive(result)) {
    return "highly-sensitive";
  }

  if (isGuidanceRequired(result)) {
    return "guidance-required";
  }

  return "safe";
}

function categorySlugs(result: ModerationBase): string[] {
  return result.categories.filter((c): c is string => typeof c === "string");
}

function findOakServiceCategory(slug: string) {
  return allOakServiceCategories.find((c) => c.code === slug);
}

function findLegacyCategory(slug: string) {
  return allAilaCategories.find((c) => c.code === slug);
}

export function moderationGuidanceText(result: ModerationBase): string {
  const slugs = categorySlugs(result);

  const oakCategories = slugs
    .map(findOakServiceCategory)
    .filter(
      (c): c is (typeof allOakServiceCategories)[number] => c !== undefined,
    );

  if (oakCategories.length === 1 && oakCategories[0]) {
    return oakCategories[0].longDescription;
  }

  if (oakCategories.length > 1) {
    const names = oakCategories.map((c) => c.shortDescription);
    return `This lesson has been flagged for: ${names.join("; ")}. Please review the content carefully and ensure it is age-appropriate and aligned with your school's policies.`;
  }

  // Legacy Aila/OpenAI category codes (historical moderations)
  const legacyDescriptions = slugs
    .map(findLegacyCategory)
    .filter((c): c is (typeof allAilaCategories)[number] => c !== undefined)
    .map((c) => c.userDescription);

  return `Contains ${legacyDescriptions.join(", ")}. Check content carefully.`;
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

export const severityPriority = [
  "heightened-caution",
  "enhanced-scrutiny",
  "content-guidance",
] as const;

export type SeverityLevel = (typeof severityPriority)[number];

export function getHighestSeverity(
  categories: { severityLevel: string }[],
): SeverityLevel {
  const levels = new Set(categories.map((c) => c.severityLevel));
  return severityPriority.find((l) => levels.has(l)) ?? "content-guidance";
}

export type DisplayCategory = {
  code: string;
  shortDescription: string;
  longDescription: string;
  severityLevel: string;
};

export function getDisplayCategories(
  result: ModerationBase,
): DisplayCategory[] {
  const slugs = categorySlugs(result);

  return slugs.flatMap((slug) => {
    const category = findOakServiceCategory(slug);
    if (!category) return [];

    const group = oakServiceCategories.find((g) =>
      g.categories.some((c) => c.code === slug),
    );
    if (!group) return [];

    return [
      {
        code: category.code,
        shortDescription: category.shortDescription,
        longDescription: category.longDescription,
        severityLevel: group.severityLevel,
      },
    ];
  });
}

const MOCK_TOXIC_RESULT: ModerationResult = {
  categories: ["t/encouragement-violence"],
  justification: "Mock toxic result",
};

const MOCK_HIGHLY_SENSITIVE_RESULT: ModerationResult = {
  categories: ["n/self-harm-suicide"],
  justification: "Mock highly sensitive result",
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
  if (message?.includes("mod:hs")) {
    log.info("mod:hs detected, returning mock highly sensitive result");
    return MOCK_HIGHLY_SENSITIVE_RESULT;
  }
  if (message?.includes("mod:sen")) {
    log.info("mod:sen detected, returning mock sensitive result");
    return MOCK_SENSITIVE_RESULT;
  }
  return null;
}
