import { aiLogger } from "@oakai/logger";

import type { ParsedChatCompletion } from "openai/resources/beta/chat/completions.mjs";

import type { PartialLessonPlan, QuizPath } from "../../../protocol/schema";
import { evaluateQuiz } from "../OpenAIRanker";
import { cachedQuiz } from "../fixtures/CachedImageQuiz";
import { CircleTheoremLesson } from "../fixtures/CircleTheoremsExampleOutput";
import type { QuizQuestionWithRawJson } from "../interfaces";
import { AiEvaluatorQuizReranker } from "./AiEvaluatorQuizReranker";
import { type RatingResponse } from "./RerankerStructuredOutputSchema";

jest.mock("../OpenAIRanker");

const log = aiLogger("aila:quiz");

describe("AiEvaluatorQuizReranker", () => {
  let reranker: AiEvaluatorQuizReranker;
  let mockQuizzes: QuizQuestionWithRawJson[][];
  let mockLessonPlan: PartialLessonPlan;
  let mockQuizType: QuizPath;

  beforeEach(() => {
    reranker = new AiEvaluatorQuizReranker();
    mockQuizzes = [cachedQuiz];
    mockLessonPlan = CircleTheoremLesson;
    mockQuizType = "/starterQuiz";
    jest.clearAllMocks();
  });

  describe("evaluateQuizArray", () => {
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
      } as unknown as ParsedChatCompletion<RatingResponse>;

      (evaluateQuiz as jest.Mock).mockResolvedValueOnce(mockResponse);

      await expect(
        reranker.evaluateQuizArray(
          mockQuizzes,
          mockLessonPlan,
          mockQuizType,
          false,
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
      } as unknown as ParsedChatCompletion<RatingResponse>;

      (evaluateQuiz as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await reranker.evaluateQuizArray(
        mockQuizzes,
        mockLessonPlan,
        mockQuizType,
        false,
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockParsedResponse);
    });
  });
});
