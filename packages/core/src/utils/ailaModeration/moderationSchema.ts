import type { JsonValue } from "@prisma/client/runtime/library";
import { z } from "zod";

export type ModerationBase = {
  categories: JsonValue[];
  justification?: string | null;
  messageId?: string | null;
};

/**
 * Category codes from the Oak Moderation Service.
 * The service applies per-category thresholds and returns flagged codes.
 */
export const oakModerationServiceCodes = [
  "l/discriminatory-language",
  "l/offensive-language",
  "u/sensitive-content",
  "u/violence-or-suffering",
  "u/mental-health-challenges",
  "u/crime-or-illegal-activities",
  "u/sexual-violence",
  "s/nudity-or-sexual-content",
  "p/practical-activities",
  "p/outdoor-learning",
  "p/additional-qualifications",
  "r/recent-content",
  "r/recent-conflicts",
  "n/self-harm-suicide",
  "n/potentially-offensive-language",
  "n/strangulation-suffocation",
  "t/guides-self-harm-suicide",
  "t/encourages-harmful-behaviour",
  "t/encourages-illegal-activity",
  "t/encourages-violence-harm-others",
  "t/using-creating-weapons",
  "t/using-creating-harmful-substances",
  "t/extreme-offensive-language",
  "e/rshe-content",
] as const;

export const moderationCategoriesSchema = z.array(
  z
    .enum([
      "l/discriminatory-behaviour",
      "l/language-may-offend",
      "l/strong-language",
      "v/conflict-or-violence",
      "v/serious-conflict-or-violence",
      "v/sexual-violence",
      "u/upsetting-content",
      "u/sensitive-content",
      "u/distressing-content",
      "s/nudity",
      "s/sexual-content",
      "p/exploration-of-objects",
      "p/equipment-safe-usage",
      "p/imitable-behaviour",
      "p/external-content",
      "p/physical-activity",
      "t/guides-self-harm",
      "t/guides-harming-others",
      "t/creating-chemical-weapons",
      "t/creating-radioactive-weapons",
      "t/creating-biological-weapons",
      "t/creating-harmful-substances",
      "t/encouragement-harmful-behaviour",
      "t/encouragement-illegal-activity",
      "t/encouragement-violence",
      // Oak Moderation Service categories
      ...oakModerationServiceCodes,
    ])
    .describe(
      "If the content scores less than 5 for any group, specify the categories on which it failed.",
    ),
);

const likertScale = z.number().int().min(1).max(5);

const moderationScoresSchema = z.object({
  l: likertScale.describe("Language and discrimination score"),
  v: likertScale.describe("Violence and crime score"),
  u: likertScale.describe("Upsetting, disturbing and sensitive score"),
  s: likertScale.describe("Nudity and sex score"),
  p: likertScale.describe("Physical activity and safety score"),
  t: likertScale.describe("Toxic score"),
});

export const oakModerationServiceScoresSchema = z.object(
  Object.fromEntries(
    oakModerationServiceCodes.map((code) => [code, likertScale]),
  ) as {
    [K in (typeof oakModerationServiceCodes)[number]]: typeof likertScale;
  },
);

/**
 * Schema for the moderation response from the LLM.
 * Note: it's important that 'categories' is the last field in the schema
 */
export const moderationResponseSchema = z.object({
  scores: moderationScoresSchema,
  justification: z.string().describe("Add justification for your scores."),
  categories: moderationCategoriesSchema,
});

/**
 * Schema for the moderation result, once parsed from the moderation response
 */
export const moderationResultSchema = z.object({
  justification: z.string().optional(),
  scores: z
    .union([moderationScoresSchema, oakModerationServiceScoresSchema])
    .optional(),
  categories: moderationCategoriesSchema,
});

export type ModerationResult = z.infer<typeof moderationResultSchema>;

export type PersistedModerationBase = ModerationBase & {
  id: string;
};
