/**
 * Zod schemas for ReportNode data.
 * Each node type has a schema defining what data it should contain when complete.
 * These serve as documentation and contract enforcement.
 */
import { z } from "zod";

import type { QuizQuestionPool } from "../interfaces";

/**
 * Generator node data (basedOnRag, rag, mlMultiTerm)
 * Note: pools validated as array of unknown, then cast to QuizQuestionPool[]
 */
export const GeneratorDataSchema = z.object({
  pools: z.array(z.unknown()),
});
export type GeneratorData = {
  pools: QuizQuestionPool[];
};

/**
 * Elasticsearch search node data
 */
export const ElasticsearchDataSchema = z.object({
  query: z.string(),
  size: z.number(),
  hitCount: z.number(),
  hitsWithScores: z.array(
    z.object({
      questionUid: z.string(),
      text: z.string(),
      score: z.number(),
      lessonSlug: z.string(),
    }),
  ),
});
export type ElasticsearchData = z.infer<typeof ElasticsearchDataSchema>;

/**
 * Cohere rerank node data
 */
export const CohereDataSchema = z.object({
  query: z.string(),
  inputCount: z.number(),
  topN: z.number(),
  allResults: z.array(
    z.object({
      questionUid: z.string(),
      text: z.string(),
      originalIndex: z.number(),
      relevanceScore: z.number(),
    }),
  ),
});
export type CohereData = z.infer<typeof CohereDataSchema>;

/**
 * Query node data (query-0, query-1, etc.)
 */
export const QueryDataSchema = z.object({
  query: z.string().optional(),
  finalCandidates: z.array(z.string()).optional(),
});
export type QueryData = z.infer<typeof QueryDataSchema>;

/**
 * Image descriptions node data
 */
export const ImageDescriptionsDataSchema = z.object({
  totalImages: z.number(),
  cacheHits: z.number(),
  cacheMisses: z.number(),
  generatedCount: z.number(),
  descriptions: z.array(
    z.object({
      url: z.string(),
      description: z.string(),
      wasCached: z.boolean(),
    }),
  ),
});
export type ImageDescriptionsData = z.infer<typeof ImageDescriptionsDataSchema>;

/**
 * Composer prompt node data
 */
export const ComposerPromptDataSchema = z.object({
  prompt: z.string(),
  candidateCount: z.number(),
});
export type ComposerPromptData = z.infer<typeof ComposerPromptDataSchema>;

/**
 * Composer LLM node data
 */
export const ComposerLlmDataSchema = z.object({
  response: z.object({
    overallStrategy: z.string(),
    selectedQuestions: z.array(
      z.object({
        questionUid: z.string(),
        reasoning: z.string(),
      }),
    ),
  }),
  selectedQuestions: z.array(z.unknown()), // RagQuizQuestion[], but complex to schema
});
export type ComposerLlmData = z.infer<typeof ComposerLlmDataSchema>;
