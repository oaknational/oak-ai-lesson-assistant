import type { LooseLessonPlan, Quiz } from "../../protocol/schema";
import type { AilaQuizService } from "../AilaServices";

interface QuizGenerator {
  retriever: DocumentRetriever;
  reranker: DocumentReranker;
  generateQuiz(context: string, options?: QuizGenerationOptions): Promise<Quiz>;
}

interface DocumentRetriever {
  retrieve(query: string): Promise<Document[]>;
}

interface DocumentReranker {
  rerank(documents: Document[], query: string): Promise<Document[]>;
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
