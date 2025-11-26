import type { SearchResponse } from "@elastic/elasticsearch/lib/api/types";
import type { RerankResponseResultsItem } from "cohere-ai/api/types";

import type { JsonPatchDocument } from "../../protocol/jsonPatchProtocol";
import type {
  AilaRagRelevantLesson,
  PartialLessonPlan,
  QuizPath,
} from "../../protocol/schema";
import type {
  LatestQuiz,
  LatestQuizQuestion,
} from "../../protocol/schemas/quiz";
import type { QuizV1Question } from "../../protocol/schemas/quiz/quizV1";
import type { HasuraQuizQuestion } from "../../protocol/schemas/quiz/rawQuiz";
import type {
  BaseType,
  MaxRatingFunctionApplier,
  RatingFunction,
} from "./ChoiceModels";
import type {
  QuizRecommenderType,
  QuizRerankerType,
  QuizSelectorType,
  QuizServiceSettings,
} from "./schema";

export type SearchResponseBody<T = unknown> = SearchResponse<T>;

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
  generateMathsExitQuizCandidates(
    lessonPlan: PartialLessonPlan,
    relevantLessons?: AilaRagRelevantLesson[],
  ): Promise<QuizQuestionPool[]>;
  generateMathsStarterQuizCandidates(
    lessonPlan: PartialLessonPlan,
    relevantLessons?: AilaRagRelevantLesson[],
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
  quizSelector: QuizSelector<BaseType>;
  quizReranker: AilaQuizReranker;
  quizGenerators: AilaQuizCandidateGenerator[];
  createBestQuiz(
    quizType: quizPatchType,
    lessonPlan: PartialLessonPlan,
    ailaRagRelevantLessons?: AilaRagRelevantLesson[],
  ): Promise<LatestQuiz>;
}

// Separating these out to allow for different types of selectors for different types of rerankers. Abstracting away allows for the LLM to potentially change the answer depending on input.
export interface QuizSelector<T extends BaseType> {
  ratingFunction: RatingFunction<T>;
  maxRatingFunctionApplier: MaxRatingFunctionApplier<T>;
  selectBestQuiz(
    questionPools: QuizQuestionPool[],
    ratingsSchemas: T[],
  ): QuizQuestionWithSourceData[];
}

export type quizPatchType = "/starterQuiz" | "/exitQuiz";

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

// TODO: At the moment the indexed "text" field is QuizV1Question which is limited to multiple choice
//       We should either update the index to use QuizV3, or we should parse the raw HasuraQuizQuestion data into QuizV3
export interface QuizQuestionWithSourceData extends QuizV1Question {
  sourceUid: string;
  source: HasuraQuizQuestion;
}

export interface CustomHit {
  _source: CustomSource;
}

export interface SimplifiedResult {
  text: string;
  questionUid: string;
}

export interface QuizQuestionPool {
  questions: QuizQuestionWithSourceData[];
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

export interface LessonSlugQuizLookup {
  getStarterQuiz(lessonSlug: string): Promise<string[]>;
  getExitQuiz(lessonSlug: string): Promise<string[]>;
  hasStarterQuiz(lessonSlug: string): Promise<boolean>;
  hasExitQuiz(lessonSlug: string): Promise<boolean>;
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
  createQuizSelector<T extends BaseType>(
    selectorType: QuizSelectorType,
  ): QuizSelector<T>;
}
