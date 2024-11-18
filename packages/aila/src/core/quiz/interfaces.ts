import type { z } from "zod";

import type { JsonPatchDocument } from "../../protocol/jsonPatchProtocol";
import type {
  LooseLessonPlan,
  Quiz,
  QuizPath,
  QuizQuestion,
} from "../../protocol/schema";
import type { AilaQuizService } from "../AilaServices";
import type { RatingFunction } from "./ChoiceModels";

export interface CustomMetadata {
  custom_id: string;
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

export type quizRecommenderType = "maths" | "default";

export type quizRerankerType = "schema-reranker";

export interface AilaQuizFactory {
  quizStrategySelector(lessonPlan: LooseLessonPlan): quizRecommenderType;
  createQuizRecommender(lessonPlan: LooseLessonPlan): AilaQuizService;
}

export interface AilaQuizRerankerFactory {
  createAilaQuizReranker(
    quizType: quizRerankerType,
  ): AilaQuizReranker<z.ZodType>;
}

export interface AilaQuizVariantService {
  rerankService: DocumentReranker;
  generateMathsStarterQuizPatch(
    lessonPlan: LooseLessonPlan,
  ): Promise<JsonPatchDocument>;
}

export interface AilaQuizReranker<T extends z.ZodType> {
  rerankQuiz(quizzes: QuizQuestion[][]): Promise<number[]>;
  evaluateQuizArray<T extends z.ZodType>(
    quizzes: QuizQuestion[][],
    lessonPlan: LooseLessonPlan,
    ratingSchema: T,
    quizType: QuizPath,
  ): Promise<T[]>;
  ratingSchema?: T;
  quizType?: QuizPath;
  ratingFunction?: RatingFunction<T>;
}

// Separating these out to allow for different types of selectors for different types of rerankers. Abstracting away allows for the LLM to potentially change the answer depending on input.
export interface QuizSelector<T extends z.ZodType> {
  selectBestQuiz(
    quizzes: QuizQuestion[][],
    ratingsSchemas: T[],
    scores: number[],
  ): QuizQuestion[];
}

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

type quizPatchType = "/starterQuiz" | "/exitQuiz";
