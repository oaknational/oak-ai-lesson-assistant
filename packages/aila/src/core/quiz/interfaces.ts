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
import type { HasuraQuiz } from "../../protocol/schemas/quiz/rawQuiz";
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

export interface AilaQuizService {
  generateMathsExitQuizPatch(
    lessonPlan: PartialLessonPlan,
  ): Promise<JsonPatchDocument>;
}

// TODO: MG - does having ailaRagRelevantLessons as an optional parameter work? It feels a bit hacky.
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

// Composer actively constructs a quiz from candidate pools
// Note: Lives in selectors/ directory but may move to composers/ in future
export interface AilaQuizComposer {
  composeQuiz(
    questionPools: QuizQuestionPool[],
    lessonPlan: PartialLessonPlan,
    quizType: QuizPath,
  ): Promise<QuizQuestionWithRawJson[]>;
}

export interface FullQuizService {
  quizSelector: QuizSelector;
  quizReranker: AilaQuizReranker;
  quizGenerators: AilaQuizCandidateGenerator[];
  buildQuiz(
    quizType: QuizPath,
    lessonPlan: PartialLessonPlan,
    ailaRagRelevantLessons?: AilaRagRelevantLesson[],
  ): Promise<LatestQuiz>;
}

// Legacy interfaces - used by reranker/selector until we migrate to composer
export interface AilaQuizReranker {
  evaluateQuizArray(
    questionPools: QuizQuestionPool[],
    lessonPlan: PartialLessonPlan,
    quizType: QuizPath,
  ): Promise<RatingResponse[]>;
}

export interface QuizSelector {
  selectQuestions(
    questionPools: QuizQuestionPool[],
    ratings: RatingResponse[],
    lessonPlan: PartialLessonPlan,
    quizType: QuizPath,
  ): Promise<QuizQuestionWithRawJson[]>;
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

export interface QuizQuestionWithRawJson extends QuizV1Question {
  rawQuiz: NonNullable<HasuraQuiz>;
}

export interface CustomHit {
  _source: CustomSource;
}

export interface SimplifiedResult {
  text: string;
  custom_id: string; // This will be populated with questionUid from the source
}

export interface SimplifiedResultQuestion {
  text: string;
  questionUid: string;
}

export interface QuizQuestionPool {
  questions: QuizQuestionWithRawJson[];
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
  createQuizSelector(selectorType: QuizSelectorType): QuizSelector;
}
