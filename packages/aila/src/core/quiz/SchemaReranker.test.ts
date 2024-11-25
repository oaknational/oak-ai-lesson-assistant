import type {
  LooseLessonPlan,
  QuizPath,
  QuizQuestion,
} from "../../protocol/schema";
import { testRatingSchema } from "./RerankerStructuredOutputSchema";
import { TestSchemaReranker } from "./SchemaReranker";
import { CircleTheoremLesson } from "./fixtures/CircleTheoremsExampleOutput";
import { cachedQuiz } from "./fixtures/fixtures_for_matt";

describe("TestSchemaReranker", () => {
  jest.setTimeout(60000);
  let reranker: TestSchemaReranker;
  let mockQuizzes: QuizQuestion[][];
  let mockLessonPlan: LooseLessonPlan;
  let mockQuizType: QuizPath;

  beforeEach(() => {
    reranker = new TestSchemaReranker();
    mockQuizzes = [cachedQuiz]; // Replace with actual mock data
    mockLessonPlan = CircleTheoremLesson; // Replace with actual mock data
    mockQuizType = "/starterQuiz"; // Example quiz type
  });

  it("should rerank quizzes and return an empty array", async () => {
    const result = await reranker.rerankQuiz(mockQuizzes);
    expect(result).toEqual([]);
    expect(Array.isArray(result)).toBe(true);
    result.forEach((item) => expect(typeof item).toBe("number"));
  });

  it("should evaluate starter quiz and return a valid schema", async () => {
    const result = await reranker.evaluateStarterQuiz(
      mockQuizzes,
      mockLessonPlan,
      testRatingSchema,
      mockQuizType,
    );
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    result.forEach((item) => {
      expect(typeof item).toBe(typeof testRatingSchema);
    });
    console.log("result", JSON.stringify(result));
  });

  it("should evaluate exit quiz and return a valid schema", async () => {
    const result = await reranker.evaluateExitQuiz(
      mockQuizzes,
      mockLessonPlan,
      testRatingSchema,
      mockQuizType,
    );
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    result.forEach((item) => {
      expect(typeof item).toBe(typeof testRatingSchema);
    });
    console.log("result", JSON.stringify(result));
  });
});
