import {
  categorySlugs,
  findLegacyCategory,
  findOakServiceCategory,
} from "./guidanceText";
import oakServiceCategories from "./moderationCategoriesOakService.json";
import type { ModerationBase } from "./moderationSchema";

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
    if (category) {
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
    }

    const legacyCategory = findLegacyCategory(slug);
    if (legacyCategory) {
      return [
        {
          code: legacyCategory.code,
          shortDescription: legacyCategory.title,
          longDescription: `Contains ${legacyCategory.userDescription}. Check content carefully.`,
          severityLevel: "content-guidance",
        },
      ];
    }

    return [];
  });
}
