import type { RerankResponseResultsItem } from "cohere-ai/api/types";

import type { JsonPatchDocument } from "../../protocol/jsonPatchProtocol";
import type {
  AilaRagRelevantLesson,
  PartialLessonPlan,
  QuizPath,
} from "../../protocol/schema";
import type {
  ImageMetadata,
  LatestQuiz,
  LatestQuizQuestion,
} from "../../protocol/schemas/quiz";
import type { HasuraQuizQuestion } from "../../protocol/schemas/quiz/rawQuiz";
import type { Task } from "./instrumentation";
import type { QuizRecommenderType, QuizServiceSettings } from "./schema";

/**
 * Extended ImageMetadata for use within the quiz RAG pipeline.
 * Adds AI-generated description for LLM context during composition.
 * The aiDescription is dropped when outputting to LatestQuiz.
 */
export interface EnrichedImageMetadata extends ImageMetadata {
  aiDescription?: string;
}

// TODO: GCLOMAX - we need to update the typing on here - do we use both cohere and replicate types?
// Replicate is just returning json anyway.
export interface DocumentReranker {
  rerankDocuments(
    query: string,
    docs: SimplifiedResult[],
    topN: number,
  ): Promise<RerankResponseResultsItem[]>;
}

export interface AilaQuizService {
  generateMathsExitQuizPatch(
    lessonPlan: PartialLessonPlan,
  ): Promise<JsonPatchDocument>;
}

/**
 * A source that retrieves candidate quiz questions from some origin
 * (e.g., similar lessons, semantic search, basedOn lesson)
 */
export interface QuestionSource {
  /** Name used for instrumentation/tracing */
  readonly name: string;

  getExitQuizCandidates(
    lessonPlan: PartialLessonPlan,
    similarLessons: AilaRagRelevantLesson[],
    task: Task,
  ): Promise<QuizQuestionPool[]>;

  getStarterQuizCandidates(
    lessonPlan: PartialLessonPlan,
    similarLessons: AilaRagRelevantLesson[],
    task: Task,
  ): Promise<QuizQuestionPool[]>;
}

/**
 * Composes final quiz questions from candidate pools
 */
export interface QuizComposer {
  /** Name used for instrumentation/tracing */
  readonly name: string;

  compose(
    questionPools: QuizQuestionPool[],
    lessonPlan: PartialLessonPlan,
    quizType: QuizPath,
    task: Task,
  ): Promise<RagQuizQuestion[]>;
}

/**
 * Enriches question pools with additional data (e.g., image descriptions).
 * Returns new enriched pools without modifying the originals.
 */
export interface QuestionEnricher {
  /** Name used for instrumentation/tracing */
  readonly name: string;

  enrich(
    questionPools: QuizQuestionPool[],
    task: Task,
  ): Promise<QuizQuestionPool[]>;
}

/**
 * Complete quiz generation service that orchestrates sources, enrichers, and composer
 */
export interface QuizService {
  composer: QuizComposer;
  sources: QuestionSource[];
  enrichers: QuestionEnricher[];
  buildQuiz(
    quizType: QuizPath,
    lessonPlan: PartialLessonPlan,
    similarLessons: AilaRagRelevantLesson[],
    task: Task,
  ): Promise<LatestQuiz>;
}

export interface CustomSource {
  text: string;
  questionUid: string;
  lessonSlug: string;
  quizPatchType: string;
  isLegacy: boolean;
  embedding: number[];
  [key: string]: unknown; // Allow for other unknown fields at the top level
}

export interface QuizQuestionTextOnlySource {
  text: string;
  metadata: {
    questionUid: string;
    lessonSlug: string;
    raw_json: string; // Allow for raw JSON data
  };
}

/**
 * Quiz question used throughout the quiz RAG pipeline.
 * Retrieved from Elasticsearch, contains the question in Latest format
 * (supporting all question types: multiple-choice, short-answer, match, order),
 * source data, and associated image metadata.
 *
 * Uses EnrichedImageMetadata which may include aiDescription for LLM context.
 */
export interface RagQuizQuestion {
  question: LatestQuizQuestion;
  sourceUid: string;
  source: HasuraQuizQuestion;
  imageMetadata: EnrichedImageMetadata[];
}

export interface CustomHit {
  _source: CustomSource;
}

export interface SimplifiedResult {
  text: string;
  questionUid: string;
}

export interface QuizQuestionPool {
  questions: RagQuizQuestion[];
  source:
    | {
        type: "basedOnLesson";
        lessonPlanId: string;
        lessonTitle: string;
      }
    | {
        type: "similarLessons";
        lessonPlanId: string;
        lessonTitle: string;
      }
    | {
        type: "semanticSearch";
        semanticQuery: string;
      };
}

export interface Document {
  document: {
    text: string;
  };
  index: number;
  relevanceScore: number;
}

export interface SimplifiedResultQuestion {
  text: string;
  questionUid: string;
}

export interface DocumentWrapper {
  document: Document;
  index: number;
  relevanceScore: number;
}

export interface QuizSet {
  exitQuiz: string[];
  starterQuiz: string[];
}

export interface QuizIDSource {
  text: QuizSet;
  metadata: { lessonSlug: string };
}
export interface LessonSlugQuizMapping {
  [lessonSlug: string]: QuizSet;
}

// FACTORIES BELOW
export interface QuizServiceFactory {
  create(settings: QuizServiceSettings): QuizService;
}

export interface AilaQuizFactory {
  quizStrategySelector(lessonPlan: PartialLessonPlan): QuizRecommenderType;
  createQuizRecommender(lessonPlan: PartialLessonPlan): AilaQuizService;
}
