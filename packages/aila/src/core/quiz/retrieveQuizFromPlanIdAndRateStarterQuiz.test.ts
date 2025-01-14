import { AilaQuiz } from "./AilaQuiz";
import { CircleTheoremLesson } from "./fixtures/CircleTheoremsExampleOutput";
import { starterQuizQuestionSuitabilityDescriptionSchema } from "./rerankers/RerankerStructuredOutputSchema";

describe("Tests retireve quiz from plan ID and rate starter quiz", () => {
  jest.setTimeout(30000);

  it("should return a quiz rating object", async () => {
    const quiz = new AilaQuiz();
    const planIDHash = "aLaUYjYaq6HGN_ttldQUl";
    const inputSchema = starterQuizQuestionSuitabilityDescriptionSchema;
    const lessonPlan = CircleTheoremLesson;
    const ratingObject = await quiz.retrieveQuizFromPlanIdAndRateStarterQuiz(
      planIDHash,
      lessonPlan,
      inputSchema,
    );
    console.log("Quiz Rating Object", JSON.stringify(ratingObject, null, 2));
    expect(ratingObject).toBeDefined();
  });
});
