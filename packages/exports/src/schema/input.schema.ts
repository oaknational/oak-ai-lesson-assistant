import { z } from "zod";

import type { DeepPartial } from "../types";

// V1 format (legacy)
export const quizQADSchema = z.object({
  question: z.string(),
  answers: z.array(z.string()),
  distractors: z.array(z.string()),
});
export type QuizQAD = z.infer<typeof quizQADSchema>;

export const quizV1Schema = z.array(quizQADSchema);
export type QuizV1 = z.infer<typeof quizV1Schema>;

// V2 format (modern) - supports all question types for import flexibility
const quizV2QuestionMultipleChoiceSchema = z.object({
  questionType: z.literal("multiple-choice"),
  question: z.string(),
  answers: z.array(z.string()),
  distractors: z.array(z.string()),
  hint: z.string().optional(),
});

const quizV2QuestionShortAnswerSchema = z.object({
  questionType: z.literal("short-answer"),
  question: z.string(),
  answers: z.array(z.string()),
  hint: z.string().optional(),
});

const quizV2QuestionMatchSchema = z.object({
  questionType: z.literal("match"),
  question: z.string(),
  answers: z.array(z.tuple([z.string(), z.string()])),
  hint: z.string().optional(),
});

const quizV2QuestionOrderSchema = z.object({
  questionType: z.literal("order"),
  question: z.string(),
  answers: z.array(z.string()),
  correctOrder: z.array(z.number()),
  hint: z.string().optional(),
});

export const quizV2QuestionSchema = z.union([
  quizV2QuestionMultipleChoiceSchema,
  quizV2QuestionShortAnswerSchema,
  quizV2QuestionMatchSchema,
  quizV2QuestionOrderSchema,
]);

export const quizV2Schema = z.object({
  version: z.literal("v2"),
  questions: z.array(quizV2QuestionSchema).min(1),
});
export type QuizV2 = z.infer<typeof quizV2Schema>;
export type QuizV2Question = z.infer<typeof quizV2QuestionSchema>;
export type QuizV2QuestionMultipleChoice = z.infer<
  typeof quizV2QuestionMultipleChoiceSchema
>;

// Union type for both formats
export const quizSchema = quizV2Schema;
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
  starterQuiz: quizSchema,
  exitQuiz: quizSchema,
  cycle1: cycleSchema,
  cycle2: cycleSchema.nullish(),
  cycle3: cycleSchema.nullish(),
  additionalMaterials: z.string().nullish(),
  _experimental_starterQuizMathsV0: quizV1Schema.nullish(),
  _experimental_exitQuizMathsV0: quizV1Schema.nullish(),
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
  starterQuiz: quizV2Schema.refine((quiz) => quiz.questions.length >= 1, {
    message: "Quiz must have at least 1 question",
  }),
  exitQuiz: quizV2Schema.refine((quiz) => quiz.questions.length >= 1, {
    message: "Quiz must have at least 1 question",
  }),
  cycle1: cycleSchema,
  cycle2: cycleSchema.nullish(),
  cycle3: cycleSchema.nullish(),
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
  topic: z.string().nullish(),
  questions: z.array(exportableQuizQuestionSchema),
});

export type ExportableQuizQuestion = z.infer<
  typeof exportableQuizQuestionSchema
>;

export type ExportableQuizAppState = z.infer<
  typeof exportableQuizAppStateSchema
>;
