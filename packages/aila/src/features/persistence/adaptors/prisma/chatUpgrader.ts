import { aiLogger } from "@oakai/logger";

import { z } from "zod";

import { convertQuizV1ToV2 } from "../../../../protocol/schemas/quiz/conversion/quizV1ToV2";

const log = aiLogger("aila:persistence");

// V1 Quiz schema - simple array of questions
const QuizV1Schema = z.array(
  z.object({
    question: z.string(),
    answers: z.array(z.string()),
    distractors: z.array(z.string()),
  }),
);

// V2 Quiz schema - discriminated union with version field
const QuizV2Schema = z.object({
  version: z.literal("v2"),
  questions: z.array(z.unknown()), // We don't need to validate the questions here
});

// Union of both quiz versions
const UpgradableQuizSchema = z.union([QuizV1Schema, QuizV2Schema]);

// Schema for a lesson plan that might have V1 or V2 quizzes
const UpgradableLessonPlanSchema = z
  .object({
    starterQuiz: UpgradableQuizSchema.optional(),
    exitQuiz: UpgradableQuizSchema.optional(),
    // All other fields are passed through without validation
  })
  .passthrough();

// Schema for a chat payload that might need upgrading
const UpgradableChatSchema = z
  .object({
    lessonPlan: z.unknown().optional(),
    // All other fields are passed through
  })
  .passthrough();

export type UpgradableQuiz = z.infer<typeof UpgradableQuizSchema>;
export type UpgradableLessonPlan = z.infer<typeof UpgradableLessonPlanSchema>;
export type UpgradableChat = z.infer<typeof UpgradableChatSchema>;

/**
 * Upgrades V1 quizzes to V2 format in a lesson plan
 * This ensures backward compatibility when loading existing lesson plans
 */
function upgradeLessonPlanQuizzes(lessonPlan: unknown): unknown {
  if (!lessonPlan || typeof lessonPlan !== "object") return lessonPlan;

  // Parse the lesson plan with our upgradable schema
  const parseResult = UpgradableLessonPlanSchema.safeParse(lessonPlan);
  if (!parseResult.success) {
    // If it doesn't match our schema, just return as-is
    log.info("Lesson plan doesn't match upgradable schema, returning as-is");
    return lessonPlan;
  }

  const upgradablePlan = parseResult.data;
  const upgraded = { ...upgradablePlan };
  let hasUpgrades = false;

  // Upgrade starterQuiz if it's V1 (array format)
  if (upgradablePlan.starterQuiz && Array.isArray(upgradablePlan.starterQuiz)) {
    upgraded.starterQuiz = convertQuizV1ToV2(upgradablePlan.starterQuiz);
    hasUpgrades = true;
    log.info("Upgraded starterQuiz from V1 to V2");
  }

  // Upgrade exitQuiz if it's V1 (array format)
  if (upgradablePlan.exitQuiz && Array.isArray(upgradablePlan.exitQuiz)) {
    upgraded.exitQuiz = convertQuizV1ToV2(upgradablePlan.exitQuiz);
    hasUpgrades = true;
    log.info("Upgraded exitQuiz from V1 to V2");
  }

  if (hasUpgrades) {
    log.info("Lesson plan quizzes upgraded from V1 to V2");
  }

  return upgraded;
}

/**
 * Upgrades a chat object from the database, converting any V1 quizzes to V2 format
 * @param rawChat - The raw chat object from the database (unknown type)
 * @returns The upgraded chat object
 */
export function upgradeChat(rawChat: unknown): unknown {
  if (!rawChat || typeof rawChat !== "object") return rawChat;

  const parseResult = UpgradableChatSchema.safeParse(rawChat);
  if (!parseResult.success) {
    // If it doesn't match our schema, just return as-is
    log.info("Chat doesn't match upgradable schema, returning as-is");
    return rawChat;
  }

  const chat = parseResult.data;

  // If there's no lesson plan, nothing to upgrade
  if (!chat.lessonPlan) {
    return chat;
  }

  // Upgrade the lesson plan
  const upgradedLessonPlan = upgradeLessonPlanQuizzes(chat.lessonPlan);

  // If nothing changed, return the original
  if (upgradedLessonPlan === chat.lessonPlan) {
    return chat;
  }

  // Return the chat with the upgraded lesson plan
  return {
    ...chat,
    lessonPlan: upgradedLessonPlan,
  };
}
