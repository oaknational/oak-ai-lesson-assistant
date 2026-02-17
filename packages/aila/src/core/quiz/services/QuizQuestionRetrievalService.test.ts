import type { PrismaClient } from "@prisma/client";

import { QuizQuestionRetrievalService } from "./QuizQuestionRetrievalService";

// Helper to create valid HasuraQuizQuestion raw_json (as a JS object, not a string)
const createValidRawJson = (uid: string, questionText: string) => ({
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

const createMockPrisma = () => ({
  ragLessonPlan: {
    findUnique: jest.fn(),
  },
  ragQuizQuestion: {
    findMany: jest.fn(),
  },
});

describe("QuizQuestionRetrievalService", () => {
  let service: QuizQuestionRetrievalService;
  let mockPrisma: ReturnType<typeof createMockPrisma>;

  beforeEach(() => {
    mockPrisma = createMockPrisma();
    service = new QuizQuestionRetrievalService(
      mockPrisma as unknown as PrismaClient,
    );
    jest.clearAllMocks();
  });

  describe("getQuestionsForPlanId", () => {
    it("should lookup lesson slug from Prisma then fetch questions", async () => {
      mockPrisma.ragLessonPlan.findUnique.mockResolvedValue({
        id: "plan-123",
        oakLessonSlug: "algebra-basics-abc123",
      });

      mockPrisma.ragQuizQuestion.findMany
        .mockResolvedValueOnce([
          { questionUid: "QUES-001" },
          { questionUid: "QUES-002" },
        ])
        .mockResolvedValueOnce([
          {
            questionUid: "QUES-001",
            rawJson: createValidRawJson("QUES-001", "What is 2+2?"),
          },
          {
            questionUid: "QUES-002",
            rawJson: createValidRawJson("QUES-002", "What is 3+3?"),
          },
        ]);

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
      mockPrisma.ragLessonPlan.findUnique.mockResolvedValue(null);

      await expect(
        service.getQuestionsForPlanId("nonexistent", "/starterQuiz"),
      ).rejects.toThrow("Lesson slug not found for planId: nonexistent");
    });

    it("should throw when lesson plan has no oakLessonSlug", async () => {
      mockPrisma.ragLessonPlan.findUnique.mockResolvedValue({
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
      mockPrisma.ragQuizQuestion.findMany.mockResolvedValue([
        { questionUid: "QUES-001" },
        { questionUid: "QUES-002" },
      ]);

      const result = await service.getStarterQuizIds("test-lesson");

      expect(result).toEqual(["QUES-001", "QUES-002"]);
      expect(mockPrisma.ragQuizQuestion.findMany).toHaveBeenCalledWith({
        where: { lessonSlug: "test-lesson", quizType: "starterQuiz" },
        select: { questionUid: true },
        orderBy: { questionPosition: "asc" },
      });
    });

    it("should return empty array when no quiz found", async () => {
      mockPrisma.ragQuizQuestion.findMany.mockResolvedValue([]);

      const result = await service.getStarterQuizIds("nonexistent-lesson");

      expect(result).toEqual([]);
    });
  });

  describe("getExitQuizIds", () => {
    it("should return exit quiz IDs for a lesson slug", async () => {
      mockPrisma.ragQuizQuestion.findMany.mockResolvedValue([
        { questionUid: "QUES-002" },
        { questionUid: "QUES-003" },
      ]);

      const result = await service.getExitQuizIds("test-lesson");

      expect(result).toEqual(["QUES-002", "QUES-003"]);
      expect(mockPrisma.ragQuizQuestion.findMany).toHaveBeenCalledWith({
        where: { lessonSlug: "test-lesson", quizType: "exitQuiz" },
        select: { questionUid: true },
        orderBy: { questionPosition: "asc" },
      });
    });
  });

  describe("retrieveQuestionsByIds", () => {
    it("should retrieve and parse questions in input order", async () => {
      mockPrisma.ragQuizQuestion.findMany.mockResolvedValue([
        {
          questionUid: "QUES-002",
          rawJson: createValidRawJson("QUES-002", "Second question"),
        },
        {
          questionUid: "QUES-001",
          rawJson: createValidRawJson("QUES-001", "First question"),
        },
      ]);

      // Request in specific order — should be preserved despite Prisma returning different order
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
      mockPrisma.ragQuizQuestion.findMany.mockResolvedValue([]);

      const result = await service.retrieveQuestionsByIds(["QUES-NONEXISTENT"]);

      expect(result).toEqual([]);
    });

    it("should return empty array for empty input", async () => {
      const result = await service.retrieveQuestionsByIds([]);

      expect(result).toEqual([]);
      expect(mockPrisma.ragQuizQuestion.findMany).not.toHaveBeenCalled();
    });

    it("should filter out questions with invalid rawJson", async () => {
      mockPrisma.ragQuizQuestion.findMany.mockResolvedValue([
        {
          questionUid: "QUES-001",
          rawJson: createValidRawJson("QUES-001", "Valid question"),
        },
        {
          questionUid: "QUES-002",
          rawJson: { invalid: "data" },
        },
      ]);

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
      mockPrisma.ragQuizQuestion.findMany.mockResolvedValue([
        { questionUid: "QUES-001" },
      ]);

      expect(await service.hasStarterQuiz("test-lesson")).toBe(true);
    });

    it("hasStarterQuiz should return false when no quiz", async () => {
      mockPrisma.ragQuizQuestion.findMany.mockResolvedValue([]);

      expect(await service.hasStarterQuiz("test-lesson")).toBe(false);
    });

    it("hasExitQuiz should return true when quiz exists", async () => {
      mockPrisma.ragQuizQuestion.findMany.mockResolvedValue([
        { questionUid: "QUES-001" },
      ]);

      expect(await service.hasExitQuiz("test-lesson")).toBe(true);
    });
  });
});
