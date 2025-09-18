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

// Modern quiz format - supports all question types for import flexibility
const quizQuestionMultipleChoiceSchema = z.object({
  questionType: z.literal("multiple-choice"),
  question: z.string(),
  answers: z.array(z.string()),
  distractors: z.array(z.string()),
  hint: z.string().nullable(),
});

const quizQuestionShortAnswerSchema = z.object({
  questionType: z.literal("short-answer"),
  question: z.string(),
  answers: z.array(z.string()),
  hint: z.string().nullable(),
});

const quizQuestionMatchSchema = z.object({
  questionType: z.literal("match"),
  question: z.string(),
  pairs: z.array(
    z.object({
      left: z.string(),
      right: z.string(),
    }),
  ),
  hint: z.string().nullable(),
});

const quizQuestionOrderSchema = z.object({
  questionType: z.literal("order"),
  question: z.string(),
  items: z.array(z.string()),
  hint: z.string().nullable(),
});

export const quizQuestionSchema = z.discriminatedUnion("questionType", [
  quizQuestionMultipleChoiceSchema,
  quizQuestionShortAnswerSchema,
  quizQuestionMatchSchema,
  quizQuestionOrderSchema,
]);

const imageAttributionSchema = z.object({
  imageUrl: z.string(),
  attribution: z.string(),
});

export const quizSchema = z.object({
  version: z.literal("v2"),
  questions: z.array(quizQuestionSchema).min(1),
  imageAttributions: z.array(imageAttributionSchema),
});
export type ImageAttribution = z.infer<typeof imageAttributionSchema>;
export type Quiz = z.infer<typeof quizSchema>;
export type QuizQuestion = z.infer<typeof quizQuestionSchema>;
export type QuizQuestionMultipleChoice = z.infer<
  typeof quizQuestionMultipleChoiceSchema
>;
export type QuizQuestionShortAnswer = z.infer<
  typeof quizQuestionShortAnswerSchema
>;
export type QuizQuestionMatch = z.infer<typeof quizQuestionMatchSchema>;
export type QuizQuestionOrder = z.infer<typeof quizQuestionOrderSchema>;
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
  starterQuiz: quizSchema,
  exitQuiz: quizSchema,
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
