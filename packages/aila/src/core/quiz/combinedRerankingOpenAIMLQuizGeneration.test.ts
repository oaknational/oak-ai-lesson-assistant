import type { QuizPath } from "../../protocol/schema";
import { AilaQuiz } from "./AilaQuiz";
import { selectHighestRated } from "./ChoiceModels";
import { CircleTheoremLesson } from "./CircleTheoremsExampleOutput";
import { TestRating, testRatingSchema } from "./RerankerStructuedOutputsSchema";

describe("Tests planIdsToQuizRatings function", () => {
  jest.setTimeout(30000);
  it("should return a valid rating index for exit quiz", async () => {
    const quiz = new AilaQuiz();
    const planIDHashes = ["aLaUYjYaq6HGN_ttldQUl", "aLaUYjYaq6HGN_ttldQUl"];
    const lessonPlan = CircleTheoremLesson;
    const inputSchema = testRatingSchema;
    const quizType: QuizPath = "/exitQuiz";

    const quizQuestions = await quiz.combinedRerankingOpenAIMLQuizGeneration(
      lessonPlan,
      inputSchema,
      quizType,
    );
    console.log("quizQuestions", JSON.stringify(quizQuestions));
    expect(quizQuestions).toBeDefined();
    expect(quizQuestions.length).toBeGreaterThan(0);
  });
});
