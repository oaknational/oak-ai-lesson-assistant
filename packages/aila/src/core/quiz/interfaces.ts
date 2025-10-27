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
  BaseType,
  MaxRatingFunctionApplier,
  RatingFunction,
} from "./ChoiceModels";
import type { RatingResponse } from "./rerankers/RerankerStructuredOutputSchema";
import type {
  QuizRecommenderType,
  QuizRerankerType,
  QuizSelectorType,
  QuizServiceSettings,
} from "./schema";

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

export interface AilaQuizGeneratorService {
  generateMathsExitQuizPatch(
    lessonPlan: PartialLessonPlan,
    relevantLessons?: AilaRagRelevantLesson[],
  ): Promise<QuizQuestionWithRawJson[][]>;
  generateMathsStarterQuizPatch(
    lessonPlan: PartialLessonPlan,
    relevantLessons?: AilaRagRelevantLesson[],
  ): Promise<QuizQuestionWithRawJson[][]>;
}

export interface AilaQuizReranker {
  evaluateQuizArray(
    quizzes: QuizQuestionWithRawJson[][],
    lessonPlan: PartialLessonPlan,
    quizType: QuizPath,
  ): Promise<RatingResponse[]>;
}

export interface FullQuizService {
  quizSelector: QuizSelector<BaseType>;
  quizReranker: AilaQuizReranker;
  quizGenerators: AilaQuizGeneratorService[];
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
    quizzes: QuizQuestionWithRawJson[][],
    ratingsSchemas: T[],
  ): QuizQuestionWithRawJson[];
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
