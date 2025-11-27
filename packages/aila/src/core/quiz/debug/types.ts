import type {
  AilaRagRelevantLesson,
  LatestQuiz,
  PartialLessonPlan,
  QuizPath,
} from "../../../protocol/schema";
import type {
  QuizQuestionPool,
  RagQuizQuestion,
  RatingResponse,
} from "../interfaces";
import type {
  QuizGeneratorType,
  QuizRerankerType,
  QuizSelectorType,
} from "../schema";
import type { CompositionResponse } from "../selectors/LLMQuizComposerPrompts";

/**
 * Full debug result from running the Quiz RAG pipeline
 */
export interface QuizRagDebugResult {
  input: {
    lessonPlan: PartialLessonPlan;
    quizType: QuizPath;
    relevantLessons: AilaRagRelevantLesson[];
  };
  generators: {
    basedOnRag?: GeneratorDebugResult;
    ailaRag?: GeneratorDebugResult;
    mlMultiTerm?: MLMultiTermDebugResult;
  };
  reranker: {
    type: QuizRerankerType;
    ratings: RatingResponse[];
  };
  selector: {
    type: QuizSelectorType;
    imageDescriptions: ImageDescriptionDebugResult;
    composerPrompt: string;
    composerResponse: CompositionResponse;
    selectedQuestions: RagQuizQuestion[];
  };
  finalQuiz: LatestQuiz;
  timing: {
    totalMs: number;
    generatorsMs: number;
    rerankerMs: number;
    selectorMs: number;
  };
}

/**
 * Debug result from a single generator
 */
export interface GeneratorDebugResult {
  generatorType: QuizGeneratorType;
  pools: QuizQuestionPool[];
  metadata?: {
    sourceLesson?: string;
    sourceLessonSlug?: string;
  };
  timingMs: number;
}

/**
 * Extended debug result for ML multi-term generator with per-query details
 */
export interface MLMultiTermDebugResult extends GeneratorDebugResult {
  searchTerms: MLSearchTermDebugResult[];
}

/**
 * Debug result for a single search term in the ML pipeline
 */
export interface MLSearchTermDebugResult {
  query: string;
  elasticsearchHits: ElasticsearchHitDebug[];
  cohereResults: CohereRerankDebug[];
  finalCandidates: RagQuizQuestion[];
  timingMs: number;
}

/**
 * Debug info for a single Elasticsearch hit
 */
export interface ElasticsearchHitDebug {
  questionUid: string;
  text: string;
  score: number;
  lessonSlug: string;
}

/**
 * Debug info for a single Cohere rerank result
 */
export interface CohereRerankDebug {
  questionUid: string;
  text: string;
  originalIndex: number;
  relevanceScore: number;
}

/**
 * Debug result for image description processing
 */
export interface ImageDescriptionDebugResult {
  totalImages: number;
  cacheHits: number;
  cacheMisses: number;
  generatedCount: number;
  descriptions: ImageDescriptionEntry[];
}

/**
 * Single image description entry
 */
export interface ImageDescriptionEntry {
  url: string;
  description: string;
  wasCached: boolean;
}
