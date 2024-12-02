import type { JsonValue } from "@prisma/client/runtime/library";
import { z } from "zod";

export type ModerationBase = {
  categories: JsonValue[];
  justification?: string | null;
  messageId?: string | null;
};

export const moderationCategoriesSchema = z.array(
  z
    .union([
      z.literal("l/discriminatory-behaviour"),
      z.literal("l/language-may-offend"),
      z.literal("l/strong-language"),
      z.literal("v/conflict-or-violence"),
      z.literal("v/serious-conflict-or-violence"),
      z.literal("v/sexual-violence"),
      z.literal("u/upsetting-content"),
      z.literal("u/sensitive-content"),
      z.literal("u/distressing-content"),
      z.literal("s/nudity"),
      z.literal("s/sexual-content"),
      z.literal("p/exploration-of-objects"),
      z.literal("p/equipment-safe-usage"),
      z.literal("p/imitable-behaviour"),
      z.literal("p/external-content"),
      z.literal("p/physical-activity"),
      z.literal("t/guides-self-harm"),
      z.literal("t/guides-harming-others"),
      z.literal("t/creating-chemical-weapons"),
      z.literal("t/creating-radioactive-weapons"),
      z.literal("t/creating-biological-weapons"),
      z.literal("t/creating-harmful-substances"),
      z.literal("t/encouragement-harmful-behaviour"),
      z.literal("t/encouragement-illegal-activity"),
      z.literal("t/encouragement-violence"),
      z.literal("t/encouragement-violence"),
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
  scores: moderationScoresSchema.optional(),
  categories: moderationCategoriesSchema,
});

export type ModerationResult = z.infer<typeof moderationResultSchema>;

export type PersistedModerationBase = ModerationBase & {
  id: string;
};
