import type { JsonValue } from "@prisma/client/runtime/library";
import { z } from "zod";

export type ModerationBase = {
  categories: JsonValue[];
  justifications?: string | null;
  messageId?: string | null;
};

export const moderationCategoriesSchema = z.array(
  z
    .union([
      z.literal("l1"),
      z.literal("l2"),
      z.literal("u1"),
      z.literal("u2"),
      z.literal("u3"),
      z.literal("u4"),
      z.literal("u5"),
      z.literal("s1"),
      z.literal("p2"),
      z.literal("p3"),
      z.literal("p4"),
      z.literal("p5"),
      z.literal("e1"),
      z.literal("r1"),
      z.literal("r2"),
      z.literal("n1"),
      z.literal("n2"),
      z.literal("n3"),
      z.literal("n4"),
      z.literal("n5"),
      z.literal("n6"),
      z.literal("n7"),
      z.literal("t1"),
      z.literal("t2"),
      z.literal("t3"),
      z.literal("t4"),
      z.literal("t5"),
      z.literal("t6"),
    ])
    .describe(
      "If the content scores less than 5 for any category, specify the categories on which it failed.",
    ),
);

const likertScale = z.number().int().min(1).max(5);

const moderationScoresSchema = z.object({
  l1: likertScale.describe("Discriminatory behaviour or language score"),
  l2: likertScale.describe("Language may offend score"),
  u1: likertScale.describe("Sensitive or upsetting content score"),
  u2: likertScale.describe("Violence or suffering score"),
  u3: likertScale.describe("Mental health challenges score"),
  u4: likertScale.describe("Crime or illegal activities score"),
  u5: likertScale.describe("Sexual violence score"),
  s1: likertScale.describe("Nudity or sexual content score"),
  p2: likertScale.describe("Equipment required score"),
  p3: likertScale.describe("Risk assessment required score"),
  p4: likertScale.describe("Outdoor learning score"),
  p5: likertScale.describe("Additional qualifications required score"),
  e1: likertScale.describe("RSHE content score"),
  r1: likertScale.describe("Recent content score"),
  r2: likertScale.describe("Recent or Current Conflicts score"),
  n1: likertScale.describe("Self-harm and Suicide score"),
  n2: likertScale.describe("History of Homosexuality and Gender Identity score"),
  n3: likertScale.describe("Child specific advice score"),
  n4: likertScale.describe("Specific Laws score"),
  n5: likertScale.describe("Health and Safety score"),
  n6: likertScale.describe("First Aid score"),
  n7: likertScale.describe("Current Conflicts score"),
  t1: likertScale.describe("Guides self-harm or suicide score"),
  t2: likertScale.describe("Encourages harmful behaviour score"),
  t3: likertScale.describe("Encourages illegal activity score"),
  t4: likertScale.describe("Encourages violence or harm to others score"),
  t5: likertScale.describe("Using or creating weapons score"),
  t6: likertScale.describe("Using or creating harmful substances score"),
});

/**
 * Schema for the moderation response from the LLM.
 * Note: it's important that 'flagged_categories' is the last field in the schema
 */
export const moderationResponseSchema = z.object({
  scores: moderationScoresSchema,
  justifications: z.record(z.string(), z.string()).describe("Justifications for scores < 5"),
  flagged_categories: moderationCategoriesSchema,
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
