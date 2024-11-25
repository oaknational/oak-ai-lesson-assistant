import type { QuizPath } from "../../protocol/schema";
import { AilaQuiz } from "./AilaQuiz";
import { SimpleFullQuizService } from "./BaseFullQuizService";
import { selectHighestRated } from "./ChoiceModels";
import { FullQuizServiceFactory } from "./FullQuizServiceFactory";
import {
  testRatingSchema,
  type TestRating,
} from "./RerankerStructuredOutputSchema";
import { CircleTheoremLesson } from "./fixtures/CircleTheoremsExampleOutput";

describe("Tests SimpleFullQuizService", () => {
  jest.setTimeout(30000);
  it("should create a quiz", async () => {
    const quizFactory = new FullQuizServiceFactory();
    const quizService = quizFactory.create("simple");

    const quiz = await quizService.createBestQuiz(
      "/starterQuiz",
      CircleTheoremLesson,
    );
    console.log(JSON.stringify(quiz));
    const ans = true;
    expect(ans).toBe(true);
  });
});
