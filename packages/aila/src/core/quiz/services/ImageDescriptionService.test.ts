import { kv } from "@vercel/kv";

import type { HasuraQuizQuestion } from "../../../protocol/schemas/quiz/rawQuiz";
import { createMockTask } from "../instrumentation";
import type { QuizQuestionPool } from "../interfaces";
import { ImageDescriptionService } from "./ImageDescriptionService";

// Subclass to expose protected methods for testing
class TestableImageDescriptionService extends ImageDescriptionService {
  public extractImageUrls(questionPools: QuizQuestionPool[]): string[] {
    return super.extractImageUrls(questionPools);
  }
}

jest.mock("@vercel/kv", () => ({
  kv: {
    mget: jest.fn(),
    set: jest.fn(),
  },
}));
jest.mock("@oakai/core/src/llm/openai");
jest.mock("p-limit", () => {
  return jest.fn(() => ({
    map: async (items: unknown[], fn: (item: unknown) => Promise<unknown>) => {
      return Promise.all(items.map(fn));
    },
  }));
});

const mockKv = kv as jest.Mocked<typeof kv>;

// Helper to create a minimal valid HasuraQuizQuestion
function createMockHasuraQuestion(
  overrides: Partial<HasuraQuizQuestion> = {},
): HasuraQuizQuestion {
  return {
    questionId: 1,
    questionUid: "test-uid",
    questionType: "multiple-choice",
    questionStem: [{ type: "text", text: "Test question" }],
    feedback: "",
    hint: "",
    active: true,
    ...overrides,
  };
}

// Helper to create a minimal valid QuizQuestionPool
function createMockQuestionPool(
  question: string,
  answers: string[] = [],
  distractors: string[] = [],
): QuizQuestionPool {
  return {
    questions: [
      {
        question: {
          questionType: "multiple-choice",
          question,
          answers,
          distractors,
          hint: null,
        },
        sourceUid: "test-uid",
        source: createMockHasuraQuestion(),
        imageMetadata: [],
      },
    ],
    source: {
      type: "ailaRag",
      lessonPlanId: "test",
      lessonTitle: "Test",
    },
  };
}

describe("ImageDescriptionService", () => {
  let service: TestableImageDescriptionService;

  beforeEach(() => {
    service = new TestableImageDescriptionService();
    jest.clearAllMocks();
  });

  describe("extractImageUrls", () => {
    it("should extract image URLs from markdown", () => {
      const questionPools = [
        createMockQuestionPool(
          "Here is ![alt](http://example.com/image.png) an image",
        ),
      ];
      const urls = service.extractImageUrls(questionPools);
      expect(urls).toEqual(["http://example.com/image.png"]);
    });

    it("should deduplicate URLs", () => {
      const questionPools = [
        createMockQuestionPool("![img1](url.png) and ![img2](url.png)"),
      ];
      const urls = service.extractImageUrls(questionPools);
      expect(urls).toEqual(["url.png"]);
    });

    it("should extract from question, answers, and distractors", () => {
      const questionPools = [
        createMockQuestionPool(
          "Question ![q](q.png)",
          ["Answer ![a](a.png)"],
          ["Distractor ![d](d.png)"],
        ),
      ];
      const urls = service.extractImageUrls(questionPools);
      expect(urls).toHaveLength(3);
      expect(urls).toContain("q.png");
      expect(urls).toContain("a.png");
      expect(urls).toContain("d.png");
    });
  });

  describe("replaceImagesWithDescriptions", () => {
    it("should replace images with descriptions", () => {
      const descriptions = new Map([["img.png", "a right triangle"]]);

      const text = "Calculate the area of ![triangle](img.png)";
      const result = ImageDescriptionService.replaceImagesWithDescriptions(
        text,
        descriptions,
      );

      expect(result).toContain("[IMAGE: a right triangle]");
      expect(result).not.toContain("![triangle](img.png)");
    });

    it("should leave images unchanged if no description", () => {
      const descriptions = new Map<string, string>();

      const text = "Calculate the area of ![triangle](img.png)";
      const result = ImageDescriptionService.replaceImagesWithDescriptions(
        text,
        descriptions,
      );

      expect(result).toContain("![triangle](img.png)");
    });

    it("should handle multiple images", () => {
      const descriptions = new Map([
        ["img1.png", "first image"],
        ["img2.png", "second image"],
      ]);

      const text = "Compare ![a](img1.png) and ![b](img2.png)";
      const result = ImageDescriptionService.replaceImagesWithDescriptions(
        text,
        descriptions,
      );

      expect(result).toContain("[IMAGE: first image]");
      expect(result).toContain("[IMAGE: second image]");
      expect(result).not.toContain("![a](img1.png)");
      expect(result).not.toContain("![b](img2.png)");
    });
  });

  describe("applyDescriptionsToQuestions", () => {
    it("should process all fields of questions in pools", () => {
      const descriptions = new Map([["url.png", "test image"]]);

      const questionPools = [
        createMockQuestionPool(
          "Q ![img](url.png)",
          ["A ![img](url.png)"],
          ["D ![img](url.png)"],
        ),
      ];

      const result = ImageDescriptionService.applyDescriptionsToQuestions(
        questionPools,
        descriptions,
      );

      const q = result[0]?.questions[0]?.question;
      expect(q?.questionType).toBe("multiple-choice");
      if (q?.questionType === "multiple-choice") {
        expect(q.question).toContain("[IMAGE: test image]");
        expect(q.answers[0]).toContain("[IMAGE: test image]");
        expect(q.distractors[0]).toContain("[IMAGE: test image]");
      }
    });
  });

  describe("getImageDescriptions", () => {
    it("should return empty map when no images", async () => {
      const questionPools = [createMockQuestionPool("Plain text question")];
      const task = createMockTask();

      const result = await service.getImageDescriptions(questionPools, task);

      expect(result.descriptions.size).toBe(0);
      expect(result.cacheHits).toBe(0);
      expect(result.cacheMisses).toBe(0);
      expect(result.generatedCount).toBe(0);
    });

    it("should use cached descriptions when available", async () => {
      const questionPools = [
        createMockQuestionPool("Question with ![img](url.png)"),
      ];
      const task = createMockTask();

      mockKv.mget.mockResolvedValue(["cached description"]);

      const result = await service.getImageDescriptions(questionPools, task);

      expect(result.descriptions.size).toBe(1);
      expect(result.descriptions.get("url.png")).toBe("cached description");
      expect(result.cacheHits).toBe(1);
      expect(result.cacheMisses).toBe(0);
      expect(result.generatedCount).toBe(0);
    });
  });
});
