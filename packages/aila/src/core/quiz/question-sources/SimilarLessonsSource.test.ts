import type { RagQuizQuestion } from "../interfaces";
import { createMockTask } from "../reporting/testing";
import type { QuizQuestionRetrievalService } from "../services/QuizQuestionRetrievalService";
import { SimilarLessonsSource } from "./SimilarLessonsSource";

const createMockQuestion = (uid: string): RagQuizQuestion => ({
  question: {
    questionType: "multiple-choice",
    question: `Test question ${uid}`,
    answers: ["Correct answer"],
    distractors: ["Wrong answer"],
    hint: null,
  },
  sourceUid: uid,
  source: {
    questionId: 1,
    questionUid: uid,
    questionStem: [{ type: "text", text: `Test question ${uid}` }],
    answers: {
      "multiple-choice": [
        {
          answer: [{ type: "text", text: "Correct answer" }],
          answer_is_correct: true,
        },
        {
          answer: [{ type: "text", text: "Wrong answer" }],
          answer_is_correct: false,
        },
      ],
    },
    questionType: "multiple-choice",
    hint: "",
    feedback: "",
    active: true,
  },
  imageMetadata: [],
});

describe("SimilarLessonsSource", () => {
  let source: SimilarLessonsSource;
  let mockRetrievalService: jest.Mocked<QuizQuestionRetrievalService>;

  beforeEach(() => {
    mockRetrievalService = {
      getQuestionsForPlanId: jest.fn(),
      getStarterQuizIds: jest.fn(),
      getExitQuizIds: jest.fn(),
      hasStarterQuiz: jest.fn(),
      hasExitQuiz: jest.fn(),
      retrieveQuestionsByIds: jest.fn(),
    } as unknown as jest.Mocked<QuizQuestionRetrievalService>;

    source = new SimilarLessonsSource(mockRetrievalService);
  });

  describe("poolsFromSimilarLessons", () => {
    it("should return pools with questions and source metadata", async () => {
      const mockQuestion1 = createMockQuestion("Q1");
      const mockQuestion2 = createMockQuestion("Q2");

      mockRetrievalService.getQuestionsForPlanId.mockResolvedValue([
        mockQuestion1,
        mockQuestion2,
      ]);

      const result = await source.poolsFromSimilarLessons(
        [{ lessonPlanId: "plan-1", title: "Algebra Basics" }],
        "/starterQuiz",
      );

      expect(result).toEqual([
        {
          questions: [mockQuestion1, mockQuestion2],
          source: {
            type: "similarLessons",
            lessonPlanId: "plan-1",
            lessonTitle: "Algebra Basics",
          },
        },
      ]);
    });

    it("should filter out lessons that return no questions", async () => {
      const mockQuestion = createMockQuestion("Q1");

      mockRetrievalService.getQuestionsForPlanId
        .mockResolvedValueOnce([mockQuestion])
        .mockResolvedValueOnce([]);

      const result = await source.poolsFromSimilarLessons(
        [
          { lessonPlanId: "plan-1", title: "Lesson 1" },
          { lessonPlanId: "plan-2", title: "Lesson 2" },
        ],
        "/starterQuiz",
      );

      expect(result).toEqual([
        {
          questions: [mockQuestion],
          source: {
            type: "similarLessons",
            lessonPlanId: "plan-1",
            lessonTitle: "Lesson 1",
          },
        },
      ]);
    });

    it("should return empty array when no similar lessons provided", async () => {
      const result = await source.poolsFromSimilarLessons([], "/starterQuiz");

      expect(result).toEqual([]);
      expect(mockRetrievalService.getQuestionsForPlanId).not.toHaveBeenCalled();
    });

    it("should limit to maxLessons (default 3)", async () => {
      const mockQuestion = createMockQuestion("Q1");
      mockRetrievalService.getQuestionsForPlanId.mockResolvedValue([
        mockQuestion,
      ]);

      const lessons = Array.from({ length: 6 }, (_, i) => ({
        lessonPlanId: `plan-${i}`,
        title: `Lesson ${i}`,
      }));

      await source.poolsFromSimilarLessons(lessons, "/starterQuiz");

      expect(mockRetrievalService.getQuestionsForPlanId).toHaveBeenCalledTimes(
        3,
      );
    });

    it("should respect custom maxLessons", async () => {
      const customSource = new SimilarLessonsSource(mockRetrievalService, 2);
      const mockQuestion = createMockQuestion("Q1");
      mockRetrievalService.getQuestionsForPlanId.mockResolvedValue([
        mockQuestion,
      ]);

      const lessons = Array.from({ length: 6 }, (_, i) => ({
        lessonPlanId: `plan-${i}`,
        title: `Lesson ${i}`,
      }));

      await customSource.poolsFromSimilarLessons(lessons, "/starterQuiz");

      expect(mockRetrievalService.getQuestionsForPlanId).toHaveBeenCalledTimes(
        2,
      );
    });
  });

  describe("getStarterQuizCandidates", () => {
    it("should call poolsFromSimilarLessons with starterQuiz", async () => {
      const mockQuestion = createMockQuestion("Q1");
      mockRetrievalService.getQuestionsForPlanId.mockResolvedValue([
        mockQuestion,
      ]);

      const result = await source.getStarterQuizCandidates(
        { title: "My Lesson" },
        [{ lessonPlanId: "plan-1", title: "Similar Lesson" }],
        createMockTask(),
      );

      expect(mockRetrievalService.getQuestionsForPlanId).toHaveBeenCalledWith(
        "plan-1",
        "/starterQuiz",
      );
      expect(result).toHaveLength(1);
    });
  });

  describe("getExitQuizCandidates", () => {
    it("should call poolsFromSimilarLessons with exitQuiz", async () => {
      const mockQuestion = createMockQuestion("Q1");
      mockRetrievalService.getQuestionsForPlanId.mockResolvedValue([
        mockQuestion,
      ]);

      const result = await source.getExitQuizCandidates(
        { title: "My Lesson" },
        [{ lessonPlanId: "plan-1", title: "Similar Lesson" }],
        createMockTask(),
      );

      expect(mockRetrievalService.getQuestionsForPlanId).toHaveBeenCalledWith(
        "plan-1",
        "/exitQuiz",
      );
      expect(result).toHaveLength(1);
    });
  });
});
