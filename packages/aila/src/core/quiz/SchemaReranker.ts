import type {
  LooseLessonPlan,
  QuizPath,
  QuizQuestion,
} from "../../protocol/schema";
import { BasedOnRagAilaQuizReranker } from "./AilaQuizReranker";
import {
  testRatingSchema,
  type TestRating,
} from "./RerankerStructuredOutputSchema";

export class TestSchemaReranker extends BasedOnRagAilaQuizReranker<TestRating> {
  public rerankQuiz(quizzes: QuizQuestion[][]): Promise<number[]> {
    return Promise.resolve([]);
  }
  public inputSchema = testRatingSchema;
  public evaluateStarterQuiz(
    quizzes: QuizQuestion[][],
    lessonPlan: LooseLessonPlan,
    ratingSchema: TestRating,
    quizType: QuizPath,
  ): Promise<TestRating[]> {
    return this.evaluateQuizArray(quizzes, lessonPlan, ratingSchema, quizType);
  }
  public evaluateExitQuiz(
    quizzes: QuizQuestion[][],
    lessonPlan: LooseLessonPlan,
    ratingSchema: TestRating,
    quizType: QuizPath,
  ): Promise<TestRating[]> {
    return this.evaluateQuizArray(quizzes, lessonPlan, ratingSchema, quizType);
  }
}

// import type { QuizPath } from "../../protocol/schema";
// import { AilaQuiz } from "./AilaQuiz";
// import { selectHighestRated } from "./ChoiceModels";
// import { CircleTheoremLesson } from "./CircleTheoremsExampleOutput";
// import { TestRating, testRatingSchema } from "./RerankerStructuredOutputSchema";

// describe("Tests planIdsToQuizRatings function", () => {
//   jest.setTimeout(30000);
//   it("should return a valid rating index for exit quiz", async () => {
//     const quiz = new AilaQuiz();
//     const planIDHashes = ["aLaUYjYaq6HGN_ttldQUl", "aLaUYjYaq6HGN_ttldQUl"];
//     const lessonPlan = CircleTheoremLesson;
//     const inputSchema = testRatingSchema;
//     const quizType: QuizPath = "/exitQuiz";

//     const quizQuestions = await quiz.combinedRerankingOpenAIMLQuizGeneration(
//       lessonPlan,
//       inputSchema,
//       quizType,
//     );
//     console.log("quizQuestions", JSON.stringify(quizQuestions));
//     expect(quizQuestions).toBeDefined();
//     expect(quizQuestions.length).toBeGreaterThan(0);
//   });
// });
