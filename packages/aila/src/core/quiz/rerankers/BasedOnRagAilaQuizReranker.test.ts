import { aiLogger } from "@oakai/logger";
import type { ParsedChatCompletion } from "openai/resources/beta/chat/completions.mjs";

import type {
  LooseLessonPlan,
  QuizPath,
  QuizQuestion,
} from "../../../protocol/schema";
import { evaluateQuiz } from "../OpenAIRanker";
import { cachedQuiz } from "../fixtures/CachedImageQuiz";
import { CircleTheoremLesson } from "../fixtures/CircleTheoremsExampleOutput";
import { BasedOnRagAilaQuizReranker } from "./AilaQuizReranker";
import { testRatingSchema } from "./RerankerStructuredOutputSchema";

jest.mock("../OpenAIRanker");

const log = aiLogger("aila:quiz");

class TestBasedOnRagReranker extends BasedOnRagAilaQuizReranker<
  typeof testRatingSchema
> {
  async rerankQuiz(quizzes: QuizQuestion[][]): Promise<number[]> {
    return [0];
  }
}

describe("BasedOnRagAilaQuizReranker", () => {
  let reranker: TestBasedOnRagReranker;
  let mockQuizzes: QuizQuestion[][];
  let mockLessonPlan: LooseLessonPlan;
  let mockQuizType: QuizPath;

  beforeEach(() => {
    reranker = new TestBasedOnRagReranker(testRatingSchema, "/starterQuiz");
    mockQuizzes = [cachedQuiz];
    mockLessonPlan = CircleTheoremLesson;
    mockQuizType = "/starterQuiz";
    jest.clearAllMocks();
  });

  describe("evaluateQuizArray", () => {
    it("should handle evaluation errors by returning a default rating object", async () => {
      const mockError = new Error("Evaluation failed");
      (evaluateQuiz as jest.Mock).mockRejectedValueOnce(mockError);

      const result = await reranker.evaluateQuizArray(
        mockQuizzes,
        mockLessonPlan,
        testRatingSchema,
        mockQuizType,
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        rating: 0,
        justification: "Error evaluating quiz: Evaluation failed",
      });
    });

    it("should handle missing parsed response from OpenAI", async () => {
      const mockResponse = {
        id: "mock-id",
        created: Date.now(),
        model: "gpt-4",
        object: "chat.completion",
        choices: [
          {
            message: {},
          },
        ],
      } as unknown as ParsedChatCompletion<typeof testRatingSchema>;

      (evaluateQuiz as jest.Mock).mockResolvedValueOnce(mockResponse);

      await expect(
        reranker.evaluateQuizArray(
          mockQuizzes,
          mockLessonPlan,
          testRatingSchema,
          mockQuizType,
        ),
      ).rejects.toThrow("Missing parsed response from OpenAI");
    });

    it("should successfully process valid OpenAI responses", async () => {
      const mockParsedResponse = {
        rating: 0.8,
        justification: "Good quiz question",
      };

      const mockResponse = {
        id: "mock-id",
        created: Date.now(),
        model: "gpt-4",
        object: "chat.completion",
        choices: [
          {
            finish_reason: "stop",
            index: 0,
            logprobs: null,
            message: {
              tool_calls: null,
              content: "",
              refusal: null,
              role: "assistant",
              parsed: mockParsedResponse,
            },
          },
        ],
      } as unknown as ParsedChatCompletion<typeof testRatingSchema>;

      (evaluateQuiz as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await reranker.evaluateQuizArray(
        mockQuizzes,
        mockLessonPlan,
        testRatingSchema,
        mockQuizType,
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockParsedResponse);
    });

    it("should handle multiple quizzes with mixed success/failure", async () => {
      const mockSuccess = {
        id: "mock-id",
        created: Date.now(),
        model: "gpt-4",
        object: "chat.completion",
        choices: [
          {
            finish_reason: "stop",
            index: 0,
            logprobs: null,
            message: {
              tool_calls: null,
              content: "",
              refusal: null,
              role: "assistant",
              parsed: {
                rating: 0.8,
                justification: "Good quiz",
              },
            },
          },
        ],
      } as unknown as ParsedChatCompletion<typeof testRatingSchema>;

      (evaluateQuiz as jest.Mock)
        .mockResolvedValueOnce(mockSuccess)
        .mockRejectedValueOnce(new Error("Failed evaluation"));

      const result = await reranker.evaluateQuizArray(
        [cachedQuiz, cachedQuiz],
        mockLessonPlan,
        testRatingSchema,
        mockQuizType,
      );

      expect(result).toEqual([
        {
          rating: 0.8,
          justification: "Good quiz",
        },
        {
          rating: 0,
          justification: "Error evaluating quiz: Failed evaluation",
        },
      ]);
    });
  });
});
