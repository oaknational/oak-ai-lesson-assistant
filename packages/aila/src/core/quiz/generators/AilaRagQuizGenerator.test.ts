import type { RagQuizQuestion } from "../interfaces";
import type { RagQuizRetrievalService } from "../services/RagQuizRetrievalService";
import { AilaRagQuizGenerator } from "./AilaRagQuizGenerator";

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

describe("AilaRagQuizGenerator", () => {
  let quizGenerator: AilaRagQuizGenerator;
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

    quizGenerator = new AilaRagQuizGenerator(mockRetrievalService);
  });

  describe("poolsFromAilaRagRelevantLessons", () => {
    it("should return pools with questions and source metadata", async () => {
      const mockQuestion1 = createMockQuestion("Q1");
      const mockQuestion2 = createMockQuestion("Q2");

      mockRetrievalService.getQuestionsForPlanId.mockResolvedValue([
        mockQuestion1,
        mockQuestion2,
      ]);

      const result = await quizGenerator.poolsFromAilaRagRelevantLessons(
        [{ lessonPlanId: "plan-1", title: "Algebra Basics" }],
        "/starterQuiz",
      );

      expect(result).toEqual([
        {
          questions: [mockQuestion1, mockQuestion2],
          source: {
            type: "ailaRag",
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

      const result = await quizGenerator.poolsFromAilaRagRelevantLessons(
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
            type: "ailaRag",
            lessonPlanId: "plan-1",
            lessonTitle: "Lesson 1",
          },
        },
      ]);
    });

    it("should return empty array when no lessons have questions", async () => {
      mockRetrievalService.getQuestionsForPlanId.mockResolvedValue([]);

      const result = await quizGenerator.poolsFromAilaRagRelevantLessons(
        [{ lessonPlanId: "plan-1", title: "Lesson 1" }],
        "/starterQuiz",
      );

      expect(result).toEqual([]);
    });
  });

  describe("generateMathsStarterQuizCandidates", () => {
    it("should request starterQuiz questions for each relevant lesson", async () => {
      mockRetrievalService.getQuestionsForPlanId.mockResolvedValue([]);

      await quizGenerator.generateMathsStarterQuizCandidates(
        { title: "Test Lesson" },
        [
          { lessonPlanId: "plan-1", title: "Lesson 1" },
          { lessonPlanId: "plan-2", title: "Lesson 2" },
        ],
      );

      expect(mockRetrievalService.getQuestionsForPlanId).toHaveBeenCalledWith(
        "plan-1",
        "/starterQuiz",
      );
      expect(mockRetrievalService.getQuestionsForPlanId).toHaveBeenCalledWith(
        "plan-2",
        "/starterQuiz",
      );
    });
  });

  describe("generateMathsExitQuizCandidates", () => {
    it("should request exitQuiz questions for each relevant lesson", async () => {
      mockRetrievalService.getQuestionsForPlanId.mockResolvedValue([]);

      await quizGenerator.generateMathsExitQuizCandidates(
        { title: "Test Lesson" },
        [{ lessonPlanId: "plan-1", title: "Lesson 1" }],
      );

      expect(mockRetrievalService.getQuestionsForPlanId).toHaveBeenCalledWith(
        "plan-1",
        "/exitQuiz",
      );
    });
  });
});
