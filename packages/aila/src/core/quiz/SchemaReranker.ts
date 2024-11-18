import type { QuizQuestion } from "../../protocol/schema";
import { BasedOnRagAilaQuizReranker } from "./AilaQuizReranker";

class SchemaReranker extends BasedOnRagAilaQuizReranker<z.ZodType> {
  public rerankQuiz(quizzes: QuizQuestion[][]): Promise<QuizQuestion[][]> {
    return Promise.resolve(quizzes);
  }
}
