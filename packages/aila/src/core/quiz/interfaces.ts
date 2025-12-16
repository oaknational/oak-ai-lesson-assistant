import type { SearchResponse } from "@elastic/elasticsearch/lib/api/types";
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
import type {
  QuizRecommenderType,
  QuizRerankerType,
  QuizSelectorType,
  QuizServiceSettings,
} from "./schema";

// Rating response from rerankers
export type RatingResponse = {
  rating: number;
  justification: string;
};

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

export interface AilaQuizCandidateGenerator {
  /** Name used for instrumentation/tracing */
  readonly name: string;

  generateMathsExitQuizCandidates(
    lessonPlan: PartialLessonPlan,
    relevantLessons: AilaRagRelevantLesson[],
    task: Task,
  ): Promise<QuizQuestionPool[]>;
  generateMathsStarterQuizCandidates(
    lessonPlan: PartialLessonPlan,
    relevantLessons: AilaRagRelevantLesson[],
    task: Task,
  ): Promise<QuizQuestionPool[]>;
}

export interface AilaQuizReranker {
  evaluateQuizArray(
    questionPools: QuizQuestionPool[],
    lessonPlan: PartialLessonPlan,
    quizType: QuizPath,
  ): Promise<RatingResponse[]>;
}

export interface FullQuizService {
  quizSelector: QuizSelector;
  quizReranker: AilaQuizReranker;
  quizGenerators: AilaQuizCandidateGenerator[];
  buildQuiz(
    quizType: QuizPath,
    lessonPlan: PartialLessonPlan,
    ailaRagRelevantLessons: AilaRagRelevantLesson[],
    task: Task,
  ): Promise<LatestQuiz>;
}

export interface QuizSelector {
  selectQuestions(
    questionPools: QuizQuestionPool[],
    ratings: RatingResponse[],
    lessonPlan: PartialLessonPlan,
    quizType: QuizPath,
    task: Task,
  ): Promise<RagQuizQuestion[]>;
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
 */
export interface RagQuizQuestion {
  question: LatestQuizQuestion;
  sourceUid: string;
  source: HasuraQuizQuestion;
  imageMetadata: ImageMetadata[];
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
        type: "basedOn";
        lessonPlanId: string;
        lessonTitle: string;
      }
    | {
        type: "ailaRag";
        lessonPlanId: string;
        lessonTitle: string;
      }
    | {
        type: "mlSemanticSearch";
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
export interface FullServiceFactory {
  create(settings: QuizServiceSettings): FullQuizService;
}

export interface AilaQuizFactory {
  quizStrategySelector(lessonPlan: PartialLessonPlan): QuizRecommenderType;
  createQuizRecommender(lessonPlan: PartialLessonPlan): AilaQuizService;
}

export interface AilaQuizRerankerFactory {
  createAilaQuizReranker(quizType: QuizRerankerType): AilaQuizReranker;
}

export interface QuizSelectorFactory {
  createQuizSelector(selectorType: QuizSelectorType): QuizSelector;
}
