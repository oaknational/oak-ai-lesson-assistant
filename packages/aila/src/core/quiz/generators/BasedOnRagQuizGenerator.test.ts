import { createMockTask } from "../instrumentation/testing";
import type { RagQuizQuestion } from "../interfaces";
import type { RagQuizRetrievalService } from "../services/RagQuizRetrievalService";
import { BasedOnRagQuizGenerator } from "./BasedOnRagQuizGenerator";

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

describe("BasedOnRagQuizGenerator", () => {
  let quizGenerator: BasedOnRagQuizGenerator;
  let mockRetrievalService: jest.Mocked<RagQuizRetrievalService>;

  beforeEach(() => {
    mockRetrievalService = {
      getQuestionsForPlanId: jest.fn(),
      getStarterQuizIds: jest.fn(),
      getExitQuizIds: jest.fn(),
      hasStarterQuiz: jest.fn(),
      hasExitQuiz: jest.fn(),
      retrieveQuestionsByIds: jest.fn(),
    } as unknown as jest.Mocked<RagQuizRetrievalService>;

    quizGenerator = new BasedOnRagQuizGenerator(mockRetrievalService);
  });

  describe("generateMathsStarterQuizCandidates", () => {
    it("should return pool with questions from basedOn lesson", async () => {
      const mockQuestion1 = createMockQuestion("Q1");
      const mockQuestion2 = createMockQuestion("Q2");

      mockRetrievalService.getQuestionsForPlanId.mockResolvedValue([
        mockQuestion1,
        mockQuestion2,
      ]);

      const result = await quizGenerator.generateMathsStarterQuizCandidates(
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
            type: "basedOn",
            lessonPlanId: "source-lesson-id",
            lessonTitle: "Source Lesson Title",
          },
        },
      ]);
    });

    it("should return empty array when lessonPlan has no basedOn", async () => {
      const result = await quizGenerator.generateMathsStarterQuizCandidates(
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

      const result = await quizGenerator.generateMathsStarterQuizCandidates(
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
        type: "basedOn",
        lessonPlanId: "source-lesson-id",
        lessonTitle: "Based on lesson",
      });
    });
  });

  describe("generateMathsExitQuizCandidates", () => {
    it("should request exitQuiz questions from basedOn lesson", async () => {
      const mockQuestion = createMockQuestion("Q1");
      mockRetrievalService.getQuestionsForPlanId.mockResolvedValue([
        mockQuestion,
      ]);

      const result = await quizGenerator.generateMathsExitQuizCandidates(
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
            type: "basedOn",
            lessonPlanId: "source-lesson-id",
            lessonTitle: "Source Lesson",
          },
        },
      ]);
    });
  });
});
