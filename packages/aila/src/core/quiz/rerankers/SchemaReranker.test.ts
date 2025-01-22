import type {
  LooseLessonPlan,
  QuizPath,
  QuizQuestion,
} from "../../../protocol/schema";
import { cachedQuiz, cachedBadQuiz } from "../fixtures/CachedImageQuiz";
import { CircleTheoremLesson } from "../fixtures/CircleTheoremsExampleOutput";
import {
  testRatingSchema,
  type TestRating,
} from "./RerankerStructuredOutputSchema";
import { TestSchemaReranker } from "./SchemaReranker";

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
      expect(testRatingSchema.safeParse(item).success).toBe(true);
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
      expect(testRatingSchema.safeParse(item).success).toBe(true);
    });
    console.log("result", JSON.stringify(result));
  });
});

describe("TestSchemaReranker Integration", () => {
  jest.setTimeout(60000);
  it("should evaluate starter quiz and return a valid schema", async () => {
    const reranker = new TestSchemaReranker();
    const quizArray = [cachedQuiz, cachedBadQuiz];
    const result = await reranker
      .evaluateStarterQuiz(
        quizArray,
        CircleTheoremLesson,
        testRatingSchema,
        "/starterQuiz",
      )
      .then((schemas) =>
        schemas.map((schema) => testRatingSchema.parse(schema)),
      );
    console.log("result", JSON.stringify(result));
    expect(result).toBeDefined();
    expect(result.length).toBe(2);
    expect(result[0]).toBeDefined();
    expect(result[1]).toBeDefined();
    if (result[0] && result[1]) {
      expect(result[0].rating).toBeDefined();
      expect(result[1].rating).toBeDefined();
      expect(result[0].rating).toBeGreaterThan(result[1].rating);
    }
  });
});
