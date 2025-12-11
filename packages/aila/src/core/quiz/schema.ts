import { z } from "zod";

// Question Source Types
export const QuestionSourceTypeSchema = z.enum([
  "similarLessons",
  "basedOnLesson",
  "multiQuerySemantic",
]);
export type QuestionSourceType = z.infer<typeof QuestionSourceTypeSchema>;

// Composer Types
export const QuizComposerTypeSchema = z.enum(["llm"]);
export type QuizComposerType = z.infer<typeof QuizComposerTypeSchema>;

// Enricher Types
export const QuestionEnricherTypeSchema = z.enum(["imageDescriptions"]);
export type QuestionEnricherType = z.infer<typeof QuestionEnricherTypeSchema>;

// Strategy Types
export const RetrievalStrategySchema = z.enum(["bm25", "blended"]);
export type RetrievalStrategy = z.infer<typeof RetrievalStrategySchema>;

export const QuizPatchTypeSchema = z.enum(["/starterQuiz", "/exitQuiz"]);
export type QuizPatchType = z.infer<typeof QuizPatchTypeSchema>;

export const QuizRecommenderTypeSchema = z.enum(["maths", "default"]);
export type QuizRecommenderType = z.infer<typeof QuizRecommenderTypeSchema>;

export const QuizServiceSettingsSchema = z.enum(["simple", "demo", "basedOn"]);
export type QuizServiceSettings = z.infer<typeof QuizServiceSettingsSchema>;

export type QuizBuilderSettings = {
  sources: QuestionSourceType[];
  enrichers: QuestionEnricherType[];
  composer: QuizComposerType;
};
