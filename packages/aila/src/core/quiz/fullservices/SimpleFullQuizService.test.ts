import type { Quiz, QuizPath } from "../../../protocol/schema";
import { QuizSchema } from "../../../protocol/schema";
import { AilaQuiz } from "../AilaQuiz";
import { selectHighestRated } from "../ChoiceModels";
import { CircleTheoremLesson } from "../fixtures/CircleTheoremsExampleOutput";
import {
  testRatingSchema,
  type TestRating,
} from "../rerankers/RerankerStructuredOutputSchema";
import { SimpleFullQuizService } from "./BaseFullQuizService";
import { FullQuizServiceFactory } from "./FullQuizServiceFactory";

describe("Tests SimpleFullQuizService", () => {
  jest.setTimeout(30000);
  it("should create a quiz", async () => {
    const quizFactory = new FullQuizServiceFactory();
    const quizService = quizFactory.create("simple");

    const quiz: Quiz = await quizService.createBestQuiz(
      "/starterQuiz",
      CircleTheoremLesson,
    );
    console.log(JSON.stringify(quiz));
    expect(QuizSchema.safeParse(quiz).success).toBe(true);
  });
});
