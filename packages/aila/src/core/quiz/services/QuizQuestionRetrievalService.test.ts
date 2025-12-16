import { prisma } from "@oakai/db";

import type { Client } from "@elastic/elasticsearch";

import { QuizQuestionRetrievalService } from "./QuizQuestionRetrievalService";

jest.mock("@oakai/db", () => ({
  prisma: {
    ragLessonPlan: {
      findUnique: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

// Helper to create valid HasuraQuizQuestion raw_json
const createValidRawJson = (uid: string, questionText: string) =>
  JSON.stringify({
    questionId: parseInt(uid.replace("QUES-", ""), 10) || 1,
    questionUid: uid,
    questionType: "multiple-choice",
    questionStem: [{ text: questionText, type: "text" }],
    answers: {
      "multiple-choice": [
        {
          answer: [{ text: "Correct", type: "text" }],
          answer_is_correct: true,
        },
        { answer: [{ text: "Wrong", type: "text" }], answer_is_correct: false },
      ],
    },
    feedback: "Good job!",
    hint: "Think about it",
    active: true,
  });

const createMockClient = () => ({
  search: jest.fn(),
});

describe("QuizQuestionRetrievalService", () => {
  let service: QuizQuestionRetrievalService;
  let mockClient: { search: jest.Mock };

  beforeEach(() => {
    mockClient = createMockClient();
    service = new QuizQuestionRetrievalService(mockClient as unknown as Client);
    jest.clearAllMocks();
  });

  describe("getQuestionsForPlanId", () => {
    it("should lookup lesson slug from Prisma then fetch questions", async () => {
      (mockPrisma.ragLessonPlan.findUnique as jest.Mock).mockResolvedValue({
        id: "plan-123",
        oakLessonSlug: "algebra-basics-abc123",
      });

      const mockQuizIds = ["QUES-001", "QUES-002"];
      const mockQuizIdResponse = {
        hits: {
          hits: [
            {
              _source: {
                text: {
                  starterQuiz: mockQuizIds,
                  exitQuiz: ["QUES-003"],
                },
                metadata: { lessonSlug: "algebra-basics-abc123" },
              },
            },
          ],
        },
      };

      const mockQuestionsResponse = {
        hits: {
          hits: [
            {
              _source: {
                text: "Question 1",
                metadata: {
                  questionUid: "QUES-001",
                  lessonSlug: "algebra-basics-abc123",
                  raw_json: createValidRawJson("QUES-001", "What is 2+2?"),
                },
              },
            },
            {
              _source: {
                text: "Question 2",
                metadata: {
                  questionUid: "QUES-002",
                  lessonSlug: "algebra-basics-abc123",
                  raw_json: createValidRawJson("QUES-002", "What is 3+3?"),
                },
              },
            },
          ],
        },
      };

      mockClient.search
        .mockResolvedValueOnce(mockQuizIdResponse)
        .mockResolvedValueOnce(mockQuestionsResponse);

      const result = await service.getQuestionsForPlanId(
        "plan-123",
        "/starterQuiz",
      );

      expect(mockPrisma.ragLessonPlan.findUnique).toHaveBeenCalledWith({
        where: { id: "plan-123" },
        select: { oakLessonSlug: true },
      });

      expect(result).toHaveLength(2);
      expect(result[0]!.sourceUid).toBe("QUES-001");
      expect(result[0]!.question.question).toBe("What is 2+2?");
      expect(result[1]!.sourceUid).toBe("QUES-002");
    });

    it("should throw when lesson plan not found", async () => {
      (mockPrisma.ragLessonPlan.findUnique as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(
        service.getQuestionsForPlanId("nonexistent", "/starterQuiz"),
      ).rejects.toThrow("Lesson slug not found for planId: nonexistent");
    });

    it("should throw when lesson plan has no oakLessonSlug", async () => {
      (mockPrisma.ragLessonPlan.findUnique as jest.Mock).mockResolvedValue({
        id: "plan-123",
        oakLessonSlug: null,
      });

      await expect(
        service.getQuestionsForPlanId("plan-123", "/starterQuiz"),
      ).rejects.toThrow("Lesson slug not found for planId: plan-123");
    });
  });

  describe("getStarterQuizIds", () => {
    it("should return starter quiz IDs for a lesson slug", async () => {
      const mockResponse = {
        hits: {
          hits: [
            {
              _source: {
                text: {
                  starterQuiz: ["QUES-001", "QUES-002"],
                  exitQuiz: ["QUES-003"],
                },
                metadata: { lessonSlug: "test-lesson" },
              },
            },
          ],
        },
      };

      mockClient.search.mockResolvedValue(mockResponse);

      const result = await service.getStarterQuizIds("test-lesson");

      expect(result).toEqual(["QUES-001", "QUES-002"]);
    });

    it("should return empty array when no quiz found", async () => {
      mockClient.search.mockResolvedValue({ hits: { hits: [] } });

      const result = await service.getStarterQuizIds("nonexistent-lesson");

      expect(result).toEqual([]);
    });
  });

  describe("getExitQuizIds", () => {
    it("should return exit quiz IDs for a lesson slug", async () => {
      const mockResponse = {
        hits: {
          hits: [
            {
              _source: {
                text: {
                  starterQuiz: ["QUES-001"],
                  exitQuiz: ["QUES-002", "QUES-003"],
                },
                metadata: { lessonSlug: "test-lesson" },
              },
            },
          ],
        },
      };

      mockClient.search.mockResolvedValue(mockResponse);

      const result = await service.getExitQuizIds("test-lesson");

      expect(result).toEqual(["QUES-002", "QUES-003"]);
    });
  });

  describe("retrieveQuestionsByIds", () => {
    it("should retrieve and parse questions in input order", async () => {
      const mockResponse = {
        hits: {
          hits: [
            {
              _source: {
                metadata: {
                  questionUid: "QUES-002",
                  raw_json: createValidRawJson("QUES-002", "Second question"),
                },
              },
            },
            {
              _source: {
                metadata: {
                  questionUid: "QUES-001",
                  raw_json: createValidRawJson("QUES-001", "First question"),
                },
              },
            },
          ],
        },
      };

      mockClient.search.mockResolvedValue(mockResponse);

      // Request in specific order - should be preserved despite ES returning different order
      const result = await service.retrieveQuestionsByIds([
        "QUES-001",
        "QUES-002",
      ]);

      expect(result).toHaveLength(2);
      expect(result[0]!.sourceUid).toBe("QUES-001");
      expect(result[0]!.question.question).toBe("First question");
      expect(result[1]!.sourceUid).toBe("QUES-002");
      expect(result[1]!.question.question).toBe("Second question");
    });

    it("should return empty array when no questions found", async () => {
      mockClient.search.mockResolvedValue({ hits: { hits: [] } });

      const result = await service.retrieveQuestionsByIds(["QUES-NONEXISTENT"]);

      expect(result).toEqual([]);
    });

    it("should filter out questions with invalid raw_json", async () => {
      const mockResponse = {
        hits: {
          hits: [
            {
              _source: {
                metadata: {
                  questionUid: "QUES-001",
                  raw_json: createValidRawJson("QUES-001", "Valid question"),
                },
              },
            },
            {
              _source: {
                metadata: {
                  questionUid: "QUES-002",
                  raw_json: "invalid json {{{",
                },
              },
            },
          ],
        },
      };

      mockClient.search.mockResolvedValue(mockResponse);

      const result = await service.retrieveQuestionsByIds([
        "QUES-001",
        "QUES-002",
      ]);

      expect(result).toHaveLength(1);
      expect(result[0]!.sourceUid).toBe("QUES-001");
    });
  });

  describe("hasStarterQuiz / hasExitQuiz", () => {
    it("hasStarterQuiz should return true when quiz exists", async () => {
      const mockResponse = {
        hits: {
          hits: [
            {
              _source: {
                text: { starterQuiz: ["QUES-001"], exitQuiz: [] },
              },
            },
          ],
        },
      };

      mockClient.search.mockResolvedValue(mockResponse);

      expect(await service.hasStarterQuiz("test-lesson")).toBe(true);
    });

    it("hasStarterQuiz should return false when no quiz", async () => {
      mockClient.search.mockResolvedValue({ hits: { hits: [] } });

      expect(await service.hasStarterQuiz("test-lesson")).toBe(false);
    });

    it("hasExitQuiz should return true when quiz exists", async () => {
      const mockResponse = {
        hits: {
          hits: [
            {
              _source: {
                text: { starterQuiz: [], exitQuiz: ["QUES-001"] },
              },
            },
          ],
        },
      };

      mockClient.search.mockResolvedValue(mockResponse);

      expect(await service.hasExitQuiz("test-lesson")).toBe(true);
    });
  });
});
