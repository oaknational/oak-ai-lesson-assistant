import { z } from "zod";

export type retrievalStrategy = "bm25" | "blended";
export type rerankerStrategy = "openai" | "elastic" | "blended";

// Generator Types
export const QuizGeneratorTypeSchema = z.enum(["rag", "ml", "basedOnRag"]);
export type QuizGeneratorType = z.infer<typeof QuizGeneratorTypeSchema>;

// Reranker Types
export const QuizRerankerTypeSchema = z.enum([
  "schema-reranker",
  "return-first",
]);
export type QuizRerankerType = z.infer<typeof QuizRerankerTypeSchema>;

// Strategy Types
export const RetrievalStrategySchema = z.enum(["bm25", "blended"]);
export type RetrievalStrategy = z.infer<typeof RetrievalStrategySchema>;

export const RerankerStrategySchema = z.enum(["openai", "elastic", "blended"]);
export type RerankerStrategy = z.infer<typeof RerankerStrategySchema>;

export const QuizSelectorTypeSchema = z.enum(["simple"]);
export type QuizSelectorType = z.infer<typeof QuizSelectorTypeSchema>;

export const QuizPatchTypeSchema = z.enum(["/starterQuiz", "/exitQuiz"]);
export type QuizPatchType = z.infer<typeof QuizPatchTypeSchema>;

export const QuizRecommenderTypeSchema = z.enum(["maths", "default"]);
export type QuizRecommenderType = z.infer<typeof QuizRecommenderTypeSchema>;

export const QuizServiceSettingsSchema = z.enum(["simple", "demo", "basedOn"]);
export type QuizServiceSettings = z.infer<typeof QuizServiceSettingsSchema>;

export type QuizBuilderSettings = {
  quizRatingSchema: z.ZodSchema<any, any, any>;
  quizSelector: QuizSelectorType;
  quizReranker: QuizRerankerType;
  quizGenerators: QuizGeneratorType[];
};
