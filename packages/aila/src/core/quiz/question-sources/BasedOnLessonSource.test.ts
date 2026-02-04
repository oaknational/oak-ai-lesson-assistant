import type { RagQuizQuestion } from "../interfaces";
import { createMockTask } from "../reporting/testing";
import type { QuizQuestionRetrievalService } from "../services/QuizQuestionRetrievalService";
import { BasedOnLessonSource } from "./BasedOnLessonSource";

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

describe("BasedOnLessonSource", () => {
  let source: BasedOnLessonSource;
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

    source = new BasedOnLessonSource(mockRetrievalService);
  });

  describe("getStarterQuizCandidates", () => {
    it("should return pool with questions from basedOn lesson", async () => {
      const mockQuestion1 = createMockQuestion("Q1");
      const mockQuestion2 = createMockQuestion("Q2");

      mockRetrievalService.getQuestionsForPlanId.mockResolvedValue([
        mockQuestion1,
        mockQuestion2,
      ]);

      const result = await source.getStarterQuizCandidates(
        {
          title: "My Lesson",
          basedOn: { id: "source-lesson-id", title: "Source Lesson Title" },
        },
        [],
        createMockTask(),
      );

      expect(mockRetrievalService.getQuestionsForPlanId).toHaveBeenCalledWith(
        "source-lesson-id",
        "/starterQuiz",
      );
      expect(result).toEqual([
        {
          questions: [mockQuestion1, mockQuestion2],
          source: {
            type: "basedOnLesson",
            lessonPlanId: "source-lesson-id",
            lessonTitle: "Source Lesson Title",
          },
        },
      ]);
    });

    it("should return empty array when lessonPlan has no basedOn", async () => {
      const result = await source.getStarterQuizCandidates(
        { title: "My Lesson" },
        [],
        createMockTask(),
      );

      expect(mockRetrievalService.getQuestionsForPlanId).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it("should use fallback title when basedOn.title is undefined", async () => {
      mockRetrievalService.getQuestionsForPlanId.mockResolvedValue([
        createMockQuestion("Q1"),
      ]);

      const result = await source.getStarterQuizCandidates(
        {
          title: "My Lesson",
          basedOn: {
            id: "source-lesson-id",
            title: undefined as unknown as string,
          },
        },
        [],
        createMockTask(),
      );

      expect(result[0]!.source).toEqual({
        type: "basedOnLesson",
        lessonPlanId: "source-lesson-id",
        lessonTitle: "Based on lesson",
      });
    });
  });

  describe("getExitQuizCandidates", () => {
    it("should request exitQuiz questions from basedOn lesson", async () => {
      const mockQuestion = createMockQuestion("Q1");
      mockRetrievalService.getQuestionsForPlanId.mockResolvedValue([
        mockQuestion,
      ]);

      const result = await source.getExitQuizCandidates(
        {
          title: "My Lesson",
          basedOn: { id: "source-lesson-id", title: "Source Lesson" },
        },
        [],
        createMockTask(),
      );

      expect(mockRetrievalService.getQuestionsForPlanId).toHaveBeenCalledWith(
        "source-lesson-id",
        "/exitQuiz",
      );
      expect(result).toEqual([
        {
          questions: [mockQuestion],
          source: {
            type: "basedOnLesson",
            lessonPlanId: "source-lesson-id",
            lessonTitle: "Source Lesson",
          },
        },
      ]);
    });
  });
});
