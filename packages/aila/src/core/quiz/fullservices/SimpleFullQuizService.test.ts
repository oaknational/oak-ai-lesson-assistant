import type { Quiz, QuizPath } from "../../protocol/schema";
import { QuizSchema } from "../../protocol/schema";
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

    const quiz: Quiz = await quizService.createBestQuiz(
      "/starterQuiz",
      CircleTheoremLesson,
    );
    console.log(JSON.stringify(quiz));
    expect(QuizSchema.safeParse(quiz).success).toBe(true);
  });
});
