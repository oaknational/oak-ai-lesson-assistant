import { z } from "zod";

import type { DeepPartial } from "../types";

export const quizQADSchema = z.object({
  question: z.string(),
  answers: z.array(z.string()),
  distractors: z.array(z.string()),
});
export type QuizQAD = z.infer<typeof quizQADSchema>;

export const quizSchema = z.array(quizQADSchema);
export type Quiz = z.infer<typeof quizSchema>;

export const cycleSchema = z.object({
  title: z.string(),
  durationInMinutes: z.number(),
  explanation: z.object({
    spokenExplanation: z.union([z.string(), z.array(z.string())]),
    accompanyingSlideDetails: z.string(),
    imagePrompt: z.string(),
    slideText: z.string(),
  }),
  checkForUnderstanding: z.array(quizQADSchema),
  practice: z.string(),
  feedback: z.string(),
});
export type Cycle = z.infer<typeof cycleSchema>;

export const misconceptionSchema = z.object({
  misconception: z.string(),
  description: z.string(),
});

export const keywordSchema = z.object({
  keyword: z.string(),
  definition: z.string(),
});

export const lessonInputSchema = z.object({
  title: z.string(),
  subject: z.string(),
  keyStage: z.string().nullish(),
  topic: z.string().nullish(),
  learningOutcome: z.string(),
  learningCycles: z.array(z.string()).min(1),
  priorKnowledge: z.array(z.string()).nullish(),
  keyLearningPoints: z.array(z.string()).min(1),
  misconceptions: z.array(misconceptionSchema).nullish(),
  keywords: z.array(keywordSchema).nullish(),
  starterQuiz: quizSchema.min(1),
  exitQuiz: quizSchema.min(1),
  cycle1: cycleSchema,
  cycle2: cycleSchema.nullish(),
  cycle3: cycleSchema.nullish(),
  additionalMaterials: z.string().nullish(),
  scienceAdditionalMaterials: z.string().nullish(),
  _experimental_starterQuizMathsV0: quizSchema.nullish(),
  _experimental_exitQuizMathsV0: quizSchema.nullish(),
});

export type LessonInputData = z.infer<typeof lessonInputSchema>;

export const lessonSlidesInputSchema = lessonInputSchema;

export type LessonSlidesInputData = z.infer<typeof lessonSlidesInputSchema>;

export const lessonPlanDocInputSchema = lessonSlidesInputSchema;

export const lessonPlanSectionsSchema = z.object({
  title: z.string(),
  subject: z.string(),
  keyStage: z.string(),
  topic: z.string().nullish(),
  learningOutcome: z.string(),
  learningCycles: z.array(z.string()).min(1),
  priorKnowledge: z.array(z.string()),
  keyLearningPoints: z.array(z.string()).min(1),
  misconceptions: z.array(misconceptionSchema),
  keywords: z.array(keywordSchema),
  starterQuiz: quizSchema.min(1),
  exitQuiz: quizSchema.min(1),
  cycle1: cycleSchema,
  cycle2: cycleSchema.nullish(),
  cycle3: cycleSchema.nullish(),
  scienceAdditionalMaterials: z.string().nullish(),
  additionalMaterials: z.string().nullish(),
});
export type LessonPlanSections = z.infer<typeof lessonPlanSectionsSchema>;

export type LessonPlanDocInputData = z.infer<typeof lessonPlanDocInputSchema>;

const cycleForWorksheetSchema = z.object({
  title: z.string(),
  practice: z.string(),
});
export const worksheetDocsInputSchema = z.object({
  title: z.string(),
  cycle1: cycleForWorksheetSchema,
  cycle2: cycleForWorksheetSchema.nullish(),
  cycle3: cycleForWorksheetSchema.nullish(),
});
export type WorksheetSlidesInputData = z.infer<typeof worksheetDocsInputSchema>;

export const quizDocInputSchema = z.object({
  quizType: z.enum(["exit", "starter"]),
  quiz: quizSchema,
  lessonTitle: z.string(),
});
export type QuizDocInputData = z.infer<typeof quizDocInputSchema>;

export type LessonDeepPartial = DeepPartial<LessonSlidesInputData>;

export enum QuizAppStatus {
  Initial = "Initial",
  EditingSubjectAndKS = "EditingSubjectAndKS",
  ResettingQuiz = "ResettingQuiz",
  EditingQuestions = "EditingQuestions",
  NonRecoverableError = "NonRecoverableError",
}

export const quizAppStatusSchema = z.nativeEnum(QuizAppStatus);

export const exportableQuizQuestionSchema = z.object({
  question: z.string(),
  answers: z.array(z.string()),
  distractors: z.array(z.string()),
  allOptions: z.array(z.string()),
});

export const exportableQuizAppStateSchema = z.object({
  status: quizAppStatusSchema,
  keyStage: z.string(),
  subject: z.string(),
  topic: z.string().optional(),
  questions: z.array(exportableQuizQuestionSchema),
});

export type ExportableQuizQuestion = z.infer<
  typeof exportableQuizQuestionSchema
>;

export type ExportableQuizAppState = z.infer<
  typeof exportableQuizAppStateSchema
>;
