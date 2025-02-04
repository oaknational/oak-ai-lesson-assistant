import { rateLimitInfoSchema } from "@oakai/api/src/types";
import {
  generationPartPlaceholderSchema,
  generationPartSchema,
} from "@oakai/core/src/types";
import { z } from "zod";

import {
  quizAppPlaceholderQuestionStateSchema,
  quizAppQuestionSchema,
  quizAppQuestionStateSchema,
} from "@/ai-apps/quiz-designer/state/types";

/**
 * LessonPlannerApp / lessonPlannerAppSchema:            The simplest way a quiz is represented
 * LessonPlannerAppState / lessonPlannerAppStateSchema:  The representation of a quiz within our app,
 *                                                       including field-level metadata
 * Lesson*State / lesson*StateSchema:                    Any schema or type suffixed with State or StateSchema
 *                                                       has additional metadata
 */

/**
 * Base schemas
 */

const misconceptionSchema = z.object({
  description: z.string(),
  misconception: z.string(),
});

export type LPMisconception = z.infer<typeof misconceptionSchema>;

const keywordSchema = z.object({
  keyword: z.string(),
  description: z.string(),
});

export type LPKeyword = z.infer<typeof keywordSchema>;

export type LPKeyLearningPoint = string;

export const lessonPlanSectionsSchema = z.object({
  keyLearningPoints: z.array(z.string()),
  misconceptions: z.array(misconceptionSchema),
  keywords: z.array(keywordSchema),
  starterQuiz: z.array(quizAppQuestionSchema),
  exitQuiz: z.array(quizAppQuestionSchema),
});

export type LessonPlanSections = z.infer<typeof lessonPlanSectionsSchema>;

/**
 * State schemas
 */

enum LessonPlannerAppStatus {
  Initial = "Initial",
  EditingSubjectAndKS = "EditingSubjectAndKS",
  GeneratingInitialPlan = "GeneratingInitialPlan",
  EditingPlan = "EditingPlan",
  Resetting = "Resetting",
  NonRecoverableError = "NonRecoverableError",
}

const lessonPlanSectionStateSchema = z.object({
  keyLearningPoints: z.array(generationPartSchema(z.string())),
  misconceptions: z.array(generationPartSchema(misconceptionSchema)),
  keywords: z.array(generationPartSchema(keywordSchema)),
  starterQuiz: z.array(quizAppQuestionStateSchema),
  exitQuiz: z.array(quizAppQuestionStateSchema),
});

const lessonPlanPlaceholderSectionStateSchema = z.object({
  keyLearningPoints: z.array(generationPartPlaceholderSchema(z.string())),
  misconceptions: z.array(generationPartPlaceholderSchema(misconceptionSchema)),
  keywords: z.array(generationPartPlaceholderSchema(keywordSchema)),
  starterQuiz: z.array(quizAppPlaceholderQuestionStateSchema),
  exitQuiz: z.array(quizAppPlaceholderQuestionStateSchema),
});

export const lessonPlannerStateSchema = z.object({
  status: z.nativeEnum(LessonPlannerAppStatus),
  sessionId: z.string().nullable(),
  subject: z.string(),
  keyStage: z.string(),
  topic: z.string(),
  lessonTitle: z.string(),
  planSections: lessonPlanSectionStateSchema,
  placeholderPlanSections: lessonPlanPlaceholderSectionStateSchema.nullable(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  rateLimit: rateLimitInfoSchema.nullable(),
});

export type LessonPlannerAppState = z.infer<typeof lessonPlannerStateSchema>;
