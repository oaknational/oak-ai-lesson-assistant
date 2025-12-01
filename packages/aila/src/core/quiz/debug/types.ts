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
    composerTimingMs: number;
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
  timingMs: number;
}

/**
 * Single image description entry
 */
export interface ImageDescriptionEntry {
  url: string;
  description: string;
  wasCached: boolean;
}

/**
 * Pipeline stage names for generators (used for tracing spans)
 */
export type GeneratorStage = "basedOnRag" | "ailaRag" | "mlMultiTerm";

/**
 * Pipeline stage names for selector (used for tracing spans)
 */
export type SelectorStage =
  | "imageDescriptions"
  | "composerPrompt"
  | "composerLlm";

/**
 * All pipeline stage names
 */
export type PipelineStage = GeneratorStage | SelectorStage;

/**
 * Status for a streaming pipeline stage
 */
export type StreamingStageStatus = "pending" | "running" | "complete" | "error";

/**
 * State for a single stage in the streaming report
 */
export interface StreamingStageState<T = unknown> {
  status: StreamingStageStatus;
  startedAt?: number;
  completedAt?: number;
  durationMs?: number;
  result?: T;
  error?: string;
}

/**
 * Composer prompt result - available before LLM call completes
 */
export interface ComposerPromptResult {
  prompt: string;
  candidateCount: number;
}

/**
 * Composer LLM result - available after LLM call completes
 */
export interface ComposerLlmResult {
  response: {
    overallStrategy: string;
    selectedQuestions: { questionUid: string; reasoning: string }[];
  };
  selectedQuestions: RagQuizQuestion[];
  timingMs: number;
}

/**
 * Full streaming report that gets updated and emitted as pipeline progresses.
 * This is the single source of truth for pipeline state during streaming.
 */
export interface QuizRagStreamingReport {
  stages: {
    basedOnRag: StreamingStageState<GeneratorDebugResult | null>;
    ailaRag: StreamingStageState<GeneratorDebugResult | null>;
    mlMultiTerm: StreamingStageState<MLMultiTermDebugResult | null>;
    imageDescriptions: StreamingStageState<ImageDescriptionDebugResult>;
    composerPrompt: StreamingStageState<ComposerPromptResult>;
    composerLlm: StreamingStageState<ComposerLlmResult>;
  };
  status: "running" | "complete" | "error";
  error?: string;
  startedAt: number;
  completedAt?: number;
}
