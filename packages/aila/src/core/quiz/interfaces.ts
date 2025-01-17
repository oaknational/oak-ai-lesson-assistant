import type { JsonPatchDocument } from "../../protocol/jsonPatchProtocol";
import type {
  AilaRagRelevantLesson,
  LooseLessonPlan,
  QuizPath,
  QuizQuestion,
} from "../../protocol/schema";
import type {
  AilaQuizGeneratorService,
  AilaQuizService,
} from "../AilaServices";
import type {
  BaseSchema,
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

// export interface QuizGenerator {
//   retriever: DocumentRetriever;
//   reranker: DocumentReranker;
//   generateQuiz(context: string, options?: QuizGenerationOptions): Promise<Quiz>;
// }

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
  ): Promise<any[]>;
}

// export interface QuizGenerationOptions {
//   numberOfQuestions?: number;
//   difficulty?: "easy" | "medium" | "hard";
//   questionTypes?: QuestionType[];
// }

export interface AilaQuizVariantService {
  rerankService: DocumentReranker;
  generateMathsStarterQuizPatch(
    lessonPlan: LooseLessonPlan,
  ): Promise<JsonPatchDocument>;
}

export interface AilaQuizReranker<T extends typeof BaseSchema> {
  rerankQuiz(quizzes: QuizQuestion[][]): Promise<number[]>;
  evaluateQuizArray(
    quizzes: QuizQuestion[][],
    lessonPlan: LooseLessonPlan,
    ratingSchema: typeof BaseSchema,
    quizType: QuizPath,
  ): Promise<T[]>;
  cachedEvaluateQuizArray(
    quizzes: QuizQuestion[][],
    lessonPlan: LooseLessonPlan,
    ratingSchema: typeof BaseSchema,
    quizType: QuizPath,
  ): Promise<T[]>;
  ratingSchema?: T;
  quizType?: QuizPath;
  ratingFunction?: RatingFunction<BaseType>;
}

// TODO: GCLOMAX - make generic by extending BaseType and BaseSchema as <T,U>
export interface FullQuizService {
  quizSelector: QuizSelector<BaseType>;
  quizReranker: AilaQuizReranker<typeof BaseSchema>;
  quizGenerators: AilaQuizGeneratorService[];
  createBestQuiz(
    quizType: quizPatchType,
    lessonPlan: LooseLessonPlan,
    ailaRagRelevantLessons?: AilaRagRelevantLesson[],
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

// TODO: GCLOMAX - check whether we are redeclaring a pretty basic type here
export type quizPatchType = "/starterQuiz" | "/exitQuiz";

export interface CustomSource {
  text: string;
  metadata: CustomMetadata;
  [key: string]: unknown; // Allow for other unknown fields at the top level
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

export interface Document {
  text: string;
}

export interface DocumentWrapper {
  document: Document;
  index: number;
  relevanceScore: number;
}

interface QuizSet {
  exitQuiz: string[];
  starterQuiz: string[];
}

export interface LessonSlugQuizMapping {
  [lessonSlug: string]: QuizSet;
}

// FACTORIES BELOW
export interface FullServiceFactory {
  create(settings: QuizServiceSettings): FullQuizService;
}
// TODO: GCLOMAX - the naming of these interfaces is confusing - sort them.

export interface AilaQuizFactory {
  quizStrategySelector(lessonPlan: LooseLessonPlan): QuizRecommenderType;
  createQuizRecommender(lessonPlan: LooseLessonPlan): AilaQuizService;
}

export interface AilaQuizRerankerFactory {
  createAilaQuizReranker(
    quizType: QuizRerankerType,
  ): AilaQuizReranker<typeof BaseSchema>;
}

export interface QuizSelectorFactory {
  createQuizSelector<T extends BaseType>(
    selectorType: QuizSelectorType,
  ): QuizSelector<T>;
}
