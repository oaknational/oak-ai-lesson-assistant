import type { JsonPatchDocument } from "../../protocol/jsonPatchProtocol";
import type { LooseLessonPlan, Quiz } from "../../protocol/schema";
import type { AilaQuizService } from "../AilaServices";
import type { SimplifiedResult } from "./AilaQuiz";

interface QuizGenerator {
  retriever: DocumentRetriever;
  reranker: DocumentReranker;
  generateQuiz(context: string, options?: QuizGenerationOptions): Promise<Quiz>;
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
  ): Promise<any[]>;
}

interface QuizGenerationOptions {
  numberOfQuestions?: number;
  difficulty?: "easy" | "medium" | "hard";
  questionTypes?: QuestionType[];
}

export type quizRecommenderType = "maths" | "default";

export interface AilaQuizFactory {
  quizStrategySelector(lessonPlan: LooseLessonPlan): quizRecommenderType;
  createQuizRecommender(lessonPlan: LooseLessonPlan): AilaQuizService;
}

export interface AilaQuizVariantService {
  rerankService: DocumentReranker;
  generateMathsStarterQuizPatch(
    lessonPlan: LooseLessonPlan,
  ): Promise<JsonPatchDocument>;
}
