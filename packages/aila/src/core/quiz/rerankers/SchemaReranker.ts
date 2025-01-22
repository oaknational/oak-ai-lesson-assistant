import type {
  LooseLessonPlan,
  QuizPath,
  QuizQuestion,
} from "../../../protocol/schema";
import { BasedOnRagAilaQuizReranker } from "./AilaQuizReranker";
import { testRatingSchema } from "./RerankerStructuredOutputSchema";

export class TestSchemaReranker extends BasedOnRagAilaQuizReranker<
  typeof testRatingSchema
> {
  public rerankQuiz(quizzes: QuizQuestion[][]): Promise<number[]> {
    return Promise.resolve([]);
  }
  public inputSchema = testRatingSchema;
  public evaluateStarterQuiz(
    quizzes: QuizQuestion[][],
    lessonPlan: LooseLessonPlan,
    ratingSchema: typeof testRatingSchema,
    quizType: QuizPath,
  ): Promise<(typeof testRatingSchema)[]> {
    return this.evaluateQuizArray(quizzes, lessonPlan, ratingSchema, quizType);
  }
  public evaluateExitQuiz(
    quizzes: QuizQuestion[][],
    lessonPlan: LooseLessonPlan,
    ratingSchema: typeof testRatingSchema,
    quizType: QuizPath,
  ): Promise<(typeof testRatingSchema)[]> {
    return this.evaluateQuizArray(quizzes, lessonPlan, ratingSchema, quizType);
  }
}
