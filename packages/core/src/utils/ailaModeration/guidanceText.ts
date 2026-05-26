import moderationCategories from "./moderationCategories.json";
import oakServiceCategories from "./moderationCategoriesOakService.json";
import type { ModerationBase } from "./moderationSchema";

const allAilaCategories = moderationCategories.flatMap(
  (group) => group.categories,
);
const allOakServiceCategories = oakServiceCategories.flatMap(
  (group) => group.categories,
);

export function categorySlugs(result: ModerationBase): string[] {
  return result.categories.filter((c): c is string => typeof c === "string");
}

export function findOakServiceCategory(slug: string) {
  return allOakServiceCategories.find((c) => c.code === slug);
}

export function findLegacyCategory(slug: string) {
  return allAilaCategories.find((c) => c.code === slug);
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
