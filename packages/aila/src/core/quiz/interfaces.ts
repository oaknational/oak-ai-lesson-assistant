import type { RerankResponseResultsItem } from "cohere-ai/api/types";
import type * as z from "zod";

import type { JsonPatchDocument } from "../../protocol/jsonPatchProtocol";
import type {
  AilaRagRelevantLesson,
  LooseLessonPlan,
  Quiz,
  QuizPath,
  QuizQuestion,
} from "../../protocol/schema";
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

export interface CustomMetadata {
  questionUid: string;
  [key: string]: unknown; // Allow for other unknown metadata fields
}

export interface DocumentRetriever {
  retrieve(query: string): Promise<Document[]>;
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
    lessonPlan: LooseLessonPlan,
  ): Promise<JsonPatchDocument>;
}

export interface AilaQuizGeneratorService {
  generateMathsExitQuizPatch(
    lessonPlan: LooseLessonPlan,
    relevantLessons?: AilaRagRelevantLesson[],
    userId?: string,
  ): Promise<Quiz[]>;
  generateMathsStarterQuizPatch(
    lessonPlan: LooseLessonPlan,
    relevantLessons?: AilaRagRelevantLesson[],
    userId?: string,
  ): Promise<Quiz[]>;
  // invoke(lessonPlan: LooseLessonPlan): Promise<Quiz[]>;
}

export interface AilaQuizVariantService {
  rerankService: DocumentReranker;
  generateMathsStarterQuizPatch(
    lessonPlan: LooseLessonPlan,
  ): Promise<JsonPatchDocument>;
}

export interface AilaQuizReranker<T extends z.ZodType<BaseType>> {
  rerankQuiz(quizzes: QuizQuestion[][]): Promise<number[]>;
  evaluateQuizArray(
    quizzes: QuizQuestion[][],
    lessonPlan: LooseLessonPlan,
    ratingSchema: T,
    quizType: QuizPath,
  ): Promise<z.infer<T>[]>;
  cachedEvaluateQuizArray(
    quizzes: QuizQuestion[][],
    lessonPlan: LooseLessonPlan,
    ratingSchema: T,
    quizType: QuizPath,
  ): Promise<z.infer<T>[]>;
  ratingSchema?: T;
  quizType?: QuizPath;
  ratingFunction?: RatingFunction<z.infer<T>>;
}

// TODO: GCLOMAX - make generic by extending BaseType and BaseSchema as <T,U>
export interface FullQuizService {
  quizSelector: QuizSelector<BaseType>;
  quizReranker: AilaQuizReranker<z.ZodType<BaseType>>;
  quizGenerators: AilaQuizGeneratorService[];
  createBestQuiz(
    quizType: quizPatchType,
    lessonPlan: LooseLessonPlan,
    ailaRagRelevantLessons?: AilaRagRelevantLesson[],
    userId?: string,
  ): Promise<QuizQuestion[]>;
}

// Separating these out to allow for different types of selectors for different types of rerankers. Abstracting away allows for the LLM to potentially change the answer depending on input.
export interface QuizSelector<T extends BaseType> {
  ratingFunction: RatingFunction<T>;
  maxRatingFunctionApplier: MaxRatingFunctionApplier<T>;
  selectBestQuiz(
    quizzes: QuizQuestion[][],
    ratingsSchemas: T[],
  ): QuizQuestion[];
}

export type quizPatchType = "/starterQuiz" | "/exitQuiz";

export interface CustomSource {
  text: string;
  metadata: CustomMetadata;
  [key: string]: unknown; // Allow for other unknown fields at the top level
}

export interface QuizQuestionTextOnlySource {
  text: string;
  metadata: { questionUid: string; lessonSlug: string };
}

export interface CustomHit {
  _source: CustomSource;
}

export interface SimplifiedResult {
  text: string;
  custom_id: string;
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
  is_legacy: boolean;
}

export interface QuizIDSource {
  text: QuizSet;
  metadata: { lessonSlug: string };
}
export interface LessonSlugQuizMapping {
  [lessonSlug: string]: QuizSet;
}

export interface LessonSlugQuizLookup {
  getStarterQuiz(lessonSlug: string, userId?: string): Promise<string[]>;
  getExitQuiz(lessonSlug: string, userId?: string): Promise<string[]>;
  hasStarterQuiz(lessonSlug: string, userId?: string): Promise<boolean>;
  hasExitQuiz(lessonSlug: string, userId?: string): Promise<boolean>;
}

// FACTORIES BELOW
export interface FullServiceFactory {
  create(settings: QuizServiceSettings): FullQuizService;
}

export interface AilaQuizFactory {
  quizStrategySelector(lessonPlan: LooseLessonPlan): QuizRecommenderType;
  createQuizRecommender(lessonPlan: LooseLessonPlan): AilaQuizService;
}

export interface AilaQuizRerankerFactory {
  createAilaQuizReranker(
    quizType: QuizRerankerType,
  ): AilaQuizReranker<z.ZodType<BaseType>>;
}

export interface QuizSelectorFactory {
  createQuizSelector<T extends BaseType>(
    selectorType: QuizSelectorType,
  ): QuizSelector<T>;
}
