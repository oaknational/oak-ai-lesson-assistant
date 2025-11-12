import { cachedQuizRatings } from "../fixtures/cachedQuizRatings";
import type { QuizQuestionPool, RatingResponse } from "../interfaces";
import { SimpleQuizSelector } from "./SimpleQuizSelector";

describe("SimpleQuizSelector", () => {
  const ratings: RatingResponse[] = cachedQuizRatings;

  it("should select the pool with the highest rating", async () => {
    const selector = new SimpleQuizSelector();

    // Create mock question pools
    const questionPools: QuizQuestionPool[] = [
      {
        questions: [],
        source: { type: "basedOn", lessonPlanId: "1", lessonTitle: "Test 1" },
      },
      {
        questions: [],
        source: { type: "ailaRag", lessonPlanId: "2", lessonTitle: "Test 2" },
      },
    ];

    const selectedQuestions = await selector.selectQuestions(
      questionPools,
      ratings,
      { title: "Test" }, // lessonPlan not used by simple selector
      "/starterQuiz",
    );

    // SimpleQuizSelector should select the pool with the highest rating (index 0 from cached ratings)
    expect(selectedQuestions).toBe(questionPools[0]?.questions);
  });
});
