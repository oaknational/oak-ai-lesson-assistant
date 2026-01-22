import type { PartialLessonPlan } from "../../../protocol/schema";
import type { LatestQuiz } from "../../../protocol/schemas/quiz";
import { createMockTask } from "../reporting/testing";
import { CurrentQuizSource } from "./CurrentQuizSource";

const createMultipleChoiceQuiz = (): LatestQuiz => ({
  version: "v3",
  questions: [
    {
      questionType: "multiple-choice",
      question: "What is 2 + 2?",
      hint: null,
      answers: ["4"],
      distractors: ["3", "5", "6"],
    },
    {
      questionType: "multiple-choice",
      question: "What is 3 × 3?",
      hint: "Think of 3 rows of 3",
      answers: ["9"],
      distractors: ["6", "8", "12"],
    },
  ],
  imageMetadata: [],
});

const createMixedQuiz = (): LatestQuiz => ({
  version: "v3",
  questions: [
    {
      questionType: "multiple-choice",
      question: "What is 2 + 2?",
      hint: null,
      answers: ["4"],
      distractors: ["3", "5"],
    },
    {
      questionType: "short-answer",
      question: "What is the square root of 16?",
      hint: null,
      answers: ["4", "four"],
    },
    {
      questionType: "match",
      question: "Match the fractions to their decimals",
      hint: null,
      pairs: [
        { left: "1/2", right: "0.5" },
        { left: "1/4", right: "0.25" },
      ],
    },
    {
      questionType: "order",
      question: "Put these fractions in ascending order",
      hint: null,
      items: ["1/4", "1/3", "1/2"],
    },
  ],
  imageMetadata: [],
});

const createQuizWithImages = (): LatestQuiz => ({
  version: "v3",
  questions: [
    {
      questionType: "multiple-choice",
      question:
        "What shape is shown? ![shape](http://example.com/triangle.png)",
      hint: null,
      answers: ["Triangle"],
      distractors: ["Square", "Circle"],
    },
    {
      questionType: "multiple-choice",
      question: "What is 2 + 2?",
      hint: null,
      answers: ["4"],
      distractors: ["3", "5"],
    },
  ],
  imageMetadata: [
    {
      imageUrl: "http://example.com/triangle.png",
      attribution: "Public domain",
      width: 100,
      height: 100,
    },
  ],
});

describe("CurrentQuizSource", () => {
  let source: CurrentQuizSource;

  beforeEach(() => {
    source = new CurrentQuizSource();
  });

  describe("getStarterQuizCandidates", () => {
    it("should return empty pool when no starterQuiz exists", async () => {
      const lessonPlan: PartialLessonPlan = {
        title: "My Lesson",
      };

      const result = await source.getStarterQuizCandidates(
        lessonPlan,
        [],
        createMockTask(),
      );

      expect(result).toEqual([]);
    });

    it("should return pool with CURRENT-Q{n} UIDs for starter quiz", async () => {
      const lessonPlan: PartialLessonPlan = {
        title: "My Lesson",
        starterQuiz: createMultipleChoiceQuiz(),
      };

      const result = await source.getStarterQuizCandidates(
        lessonPlan,
        [],
        createMockTask(),
      );

      expect(result).toHaveLength(1);
      expect(result[0]!.source).toEqual({
        type: "currentQuiz",
        quizType: "/starterQuiz",
      });
      expect(result[0]!.questions).toHaveLength(2);
      expect(result[0]!.questions[0]!.sourceUid).toBe("CURRENT-Q1");
      expect(result[0]!.questions[1]!.sourceUid).toBe("CURRENT-Q2");
    });

    it("should convert all question types correctly", async () => {
      const lessonPlan: PartialLessonPlan = {
        title: "My Lesson",
        starterQuiz: createMixedQuiz(),
      };

      const result = await source.getStarterQuizCandidates(
        lessonPlan,
        [],
        createMockTask(),
      );

      expect(result[0]!.questions).toHaveLength(4);
      expect(result[0]!.questions[0]!.sourceUid).toBe("CURRENT-Q1");
      expect(result[0]!.questions[1]!.sourceUid).toBe("CURRENT-Q2");
      expect(result[0]!.questions[2]!.sourceUid).toBe("CURRENT-Q3");
      expect(result[0]!.questions[3]!.sourceUid).toBe("CURRENT-Q4");

      // Verify question types are preserved
      expect(result[0]!.questions[0]!.question.questionType).toBe(
        "multiple-choice",
      );
      expect(result[0]!.questions[1]!.question.questionType).toBe(
        "short-answer",
      );
      expect(result[0]!.questions[2]!.question.questionType).toBe("match");
      expect(result[0]!.questions[3]!.question.questionType).toBe("order");
    });

    it("should extract image metadata for questions containing images", async () => {
      const lessonPlan: PartialLessonPlan = {
        title: "My Lesson",
        starterQuiz: createQuizWithImages(),
      };

      const result = await source.getStarterQuizCandidates(
        lessonPlan,
        [],
        createMockTask(),
      );

      // First question references an image
      expect(result[0]!.questions[0]!.imageMetadata).toHaveLength(1);
      expect(result[0]!.questions[0]!.imageMetadata[0]!.imageUrl).toBe(
        "http://example.com/triangle.png",
      );

      // Second question has no images
      expect(result[0]!.questions[1]!.imageMetadata).toHaveLength(0);
    });
  });

  describe("getExitQuizCandidates", () => {
    it("should return empty pool when no exitQuiz exists", async () => {
      const lessonPlan: PartialLessonPlan = {
        title: "My Lesson",
      };

      const result = await source.getExitQuizCandidates(
        lessonPlan,
        [],
        createMockTask(),
      );

      expect(result).toEqual([]);
    });

    it("should return pool with correct quiz type for exit quiz", async () => {
      const lessonPlan: PartialLessonPlan = {
        title: "My Lesson",
        exitQuiz: createMultipleChoiceQuiz(),
      };

      const result = await source.getExitQuizCandidates(
        lessonPlan,
        [],
        createMockTask(),
      );

      expect(result).toHaveLength(1);
      expect(result[0]!.source).toEqual({
        type: "currentQuiz",
        quizType: "/exitQuiz",
      });
    });

    it("should use exitQuiz, not starterQuiz", async () => {
      const starterQuiz = createMultipleChoiceQuiz();
      const exitQuiz: LatestQuiz = {
        version: "v3",
        questions: [
          {
            questionType: "multiple-choice",
            question: "Exit quiz question",
            hint: null,
            answers: ["A"],
            distractors: ["B"],
          },
        ],
        imageMetadata: [],
      };

      const lessonPlan: PartialLessonPlan = {
        title: "My Lesson",
        starterQuiz,
        exitQuiz,
      };

      const result = await source.getExitQuizCandidates(
        lessonPlan,
        [],
        createMockTask(),
      );

      expect(result[0]!.questions).toHaveLength(1);
      expect(result[0]!.questions[0]!.question.question).toBe(
        "Exit quiz question",
      );
    });
  });

  describe("synthetic HasuraQuizQuestion source", () => {
    it("should create valid Hasura source for multiple-choice questions", async () => {
      const lessonPlan: PartialLessonPlan = {
        title: "My Lesson",
        starterQuiz: createMultipleChoiceQuiz(),
      };

      const result = await source.getStarterQuizCandidates(
        lessonPlan,
        [],
        createMockTask(),
      );

      const hasuraSource = result[0]!.questions[0]!.source;
      expect(hasuraSource.questionId).toBe(0);
      expect(hasuraSource.questionUid).toBe("CURRENT-Q1");
      expect(hasuraSource.questionType).toBe("multiple-choice");
      expect(hasuraSource.questionStem).toEqual([
        { type: "text", text: "What is 2 + 2?" },
      ]);
      expect(hasuraSource.answers?.["multiple-choice"]).toHaveLength(4); // 1 correct + 3 distractors
    });

    it("should create valid Hasura source for match questions", async () => {
      const lessonPlan: PartialLessonPlan = {
        title: "My Lesson",
        starterQuiz: createMixedQuiz(),
      };

      const result = await source.getStarterQuizCandidates(
        lessonPlan,
        [],
        createMockTask(),
      );

      const matchQuestion = result[0]!.questions[2]!;
      expect(matchQuestion.source.questionType).toBe("match");
      expect(matchQuestion.source.answers?.match).toHaveLength(2);
      expect(matchQuestion.source.answers?.match?.[0]).toMatchObject({
        match_option: [{ type: "text", text: "1/2" }],
        correct_choice: [{ type: "text", text: "0.5" }],
      });
    });

    it("should create valid Hasura source for order questions", async () => {
      const lessonPlan: PartialLessonPlan = {
        title: "My Lesson",
        starterQuiz: createMixedQuiz(),
      };

      const result = await source.getStarterQuizCandidates(
        lessonPlan,
        [],
        createMockTask(),
      );

      const orderQuestion = result[0]!.questions[3]!;
      expect(orderQuestion.source.questionType).toBe("order");
      expect(orderQuestion.source.answers?.order).toHaveLength(3);
      expect(orderQuestion.source.answers?.order?.[0]).toMatchObject({
        answer: [{ type: "text", text: "1/4" }],
        correct_order: 1,
      });
    });
  });
});
