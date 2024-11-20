import type { QuizPath } from "../../protocol/schema";
import { AilaQuiz } from "./AilaQuiz";
import { selectHighestRated } from "./ChoiceModels";
import { CircleTheoremLesson } from "./CircleTheoremsExampleOutput";
import { TestRating, testRatingSchema } from "./RerankerStructuredOutputSchema";

describe("Tests SimpleFullQuizService", () => {
  jest.setTimeout(30000);
  it("should create a quiz", async () => {