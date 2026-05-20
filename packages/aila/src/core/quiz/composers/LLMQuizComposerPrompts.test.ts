import type { PartialLessonPlan } from "../../../protocol/schema";
import type {
  QuizBuildMode,
  QuizQuestionPool,
  RagQuizQuestion,
} from "../interfaces";
import {
  buildCompositionPrompt,
  buildCompositionResponseSchema,
} from "./LLMQuizComposerPrompts";

const FULL_REGEN: QuizBuildMode = { kind: "fullRegen" };
const ADD_ONE: QuizBuildMode = { kind: "addOne" };
const REWRITE_ONE = (position: number): QuizBuildMode => ({
  kind: "rewriteOne",
  position,
});

const mockMultipleChoice = (
  uid: string,
  questionText: string,
): RagQuizQuestion => ({
  question: {
    questionType: "multiple-choice",
    question: questionText,
    hint: null,
    answers: ["Correct answer 1", "Correct answer 2"],
    distractors: ["Wrong answer 1", "Wrong answer 2", "Wrong answer 3"],
  },
  sourceUid: uid,
  imageMetadata: [],
});

const mockShortAnswer = (
  uid: string,
  questionText: string,
): RagQuizQuestion => ({
  question: {
    questionType: "short-answer",
    question: questionText,
    hint: null,
    answers: ["Acceptable answer 1", "Acceptable answer 2"],
  },
  sourceUid: uid,
  imageMetadata: [],
});

const mockMatch = (uid: string, questionText: string): RagQuizQuestion => ({
  question: {
    questionType: "match",
    question: questionText,
    hint: null,
    pairs: [
      { left: "Term A", right: "Definition A" },
      { left: "Term B", right: "Definition B" },
      { left: "Term C", right: "Definition C" },
    ],
  },
  sourceUid: uid,
  imageMetadata: [],
});

const mockOrder = (uid: string, questionText: string): RagQuizQuestion => ({
  question: {
    questionType: "order",
    question: questionText,
    hint: null,
    items: ["First step", "Second step", "Third step", "Fourth step"],
  },
  sourceUid: uid,
  imageMetadata: [],
});

const mockLessonPlan: PartialLessonPlan = {
  title: "Adding Fractions",
  subject: "maths",
  keyStage: "key-stage-3",
  topic: "Fractions",
  learningOutcome: "I can add fractions with different denominators",
  priorKnowledge: [
    "Understanding of equivalent fractions",
    "Ability to find common denominators",
    "Basic fraction notation",
  ],
  keyLearningPoints: [
    "To add fractions, they must have the same denominator",
    "Find the lowest common multiple for denominators",
    "Add numerators while keeping the common denominator",
  ],
};

const mockQuestionPools: QuizQuestionPool[] = [
  {
    source: {
      type: "semanticSearch",
      semanticQuery: "adding fractions with different denominators",
    },
    questions: [
      mockMultipleChoice("q1", "What is 1/2 + 1/4?"),
      mockShortAnswer("q2", "Calculate 2/3 + 1/6 and simplify your answer"),
    ],
  },
  {
    source: {
      type: "basedOnLesson",
      lessonPlanId: "lesson-123",
      lessonTitle: "Introduction to Fractions",
    },
    questions: [
      mockMatch("q3", "Match each fraction to its equivalent decimal"),
      mockOrder("q4", "Put these steps for adding fractions in order"),
    ],
  },
];

describe("buildCompositionPrompt", () => {
  describe("image description replacement", () => {
    it("should replace markdown images with descriptions in prompt", () => {
      const questionWithImage: RagQuizQuestion = {
        question: {
          questionType: "multiple-choice",
          question:
            "Calculate the area of ![triangle](http://example.com/img.png)",
          hint: null,
          answers: ["6 cm²"],
          distractors: ["12 cm²", "3 cm²"],
        },
        sourceUid: "q-img",
        imageMetadata: [
          {
            imageUrl: "http://example.com/img.png",
            attribution: null,
            width: 100,
            height: 100,
            aiDescription: "a right triangle with base 3cm and height 4cm",
          },
        ],
      };

      const pools: QuizQuestionPool[] = [
        {
          source: { type: "semanticSearch", semanticQuery: "area" },
          questions: [questionWithImage],
        },
      ];

      const prompt = buildCompositionPrompt(pools, mockLessonPlan, "/exitQuiz", FULL_REGEN);

      expect(prompt).toContain(
        "[IMAGE: a right triangle with base 3cm and height 4cm]",
      );
      expect(prompt).not.toContain("![triangle](http://example.com/img.png)");
    });

    it("should throw when aiDescription is empty", () => {
      const questionWithImage: RagQuizQuestion = {
        question: {
          questionType: "multiple-choice",
          question:
            "Calculate the area of ![triangle](http://example.com/img.png)",
          hint: null,
          answers: ["6 cm²"],
          distractors: ["12 cm²"],
        },
        sourceUid: "q-img",
        imageMetadata: [
          {
            imageUrl: "http://example.com/img.png",
            attribution: null,
            width: 100,
            height: 100,
            aiDescription: "",
          },
        ],
      };

      const pools: QuizQuestionPool[] = [
        {
          source: { type: "semanticSearch", semanticQuery: "area" },
          questions: [questionWithImage],
        },
      ];

      expect(() =>
        buildCompositionPrompt(pools, mockLessonPlan, "/exitQuiz", FULL_REGEN),
      ).toThrow("Missing aiDescription for image");
    });

    it("should replace images in answers and distractors", () => {
      const questionWithImages: RagQuizQuestion = {
        question: {
          questionType: "multiple-choice",
          question: "Which shape has the largest area?",
          hint: null,
          answers: ["![correct](http://example.com/correct.png)"],
          distractors: ["![wrong](http://example.com/wrong.png)"],
        },
        sourceUid: "q-img",
        imageMetadata: [
          {
            imageUrl: "http://example.com/correct.png",
            attribution: null,
            width: 100,
            height: 100,
            aiDescription: "a square with side 5cm",
          },
          {
            imageUrl: "http://example.com/wrong.png",
            attribution: null,
            width: 100,
            height: 100,
            aiDescription: "a rectangle 2cm by 3cm",
          },
        ],
      };

      const pools: QuizQuestionPool[] = [
        {
          source: { type: "semanticSearch", semanticQuery: "area" },
          questions: [questionWithImages],
        },
      ];

      const prompt = buildCompositionPrompt(pools, mockLessonPlan, "/exitQuiz", FULL_REGEN);

      expect(prompt).toContain("[IMAGE: a square with side 5cm]");
      expect(prompt).toContain("[IMAGE: a rectangle 2cm by 3cm]");
    });
  });

  describe("starter vs exit quiz differentiation", () => {
    it("starter quiz focuses on prior knowledge", () => {
      const prompt = buildCompositionPrompt(
        mockQuestionPools,
        mockLessonPlan,
        "/starterQuiz",
        FULL_REGEN,
      );

      expect(prompt).toContain("Compose a starter quiz");
      expect(prompt).toContain("Assess students' prior knowledge");
      expect(prompt).toContain("Prior knowledge to assess:");
      expect(prompt).toContain("1. Understanding of equivalent fractions");
      expect(prompt).toContain(
        "Questions address the specific prior knowledge outlined in the lesson plan",
      );
      expect(prompt).not.toContain("Compose an exit quiz");
      expect(prompt).not.toContain(
        "Questions target the key learning points and learning outcome",
      );
    });

    it("exit quiz focuses on key learning points", () => {
      const prompt = buildCompositionPrompt(
        mockQuestionPools,
        mockLessonPlan,
        "/exitQuiz",
        FULL_REGEN,
      );

      expect(prompt).toContain("Compose an exit quiz");
      expect(prompt).toContain("Assess learning outcomes");
      expect(prompt).toContain("Key learning points to assess:");
      expect(prompt).toContain(
        "1. To add fractions, they must have the same denominator",
      );
      expect(prompt).toContain(
        "Questions target the key learning points and learning outcome",
      );
      expect(prompt).not.toContain("Compose a starter quiz");
      expect(prompt).not.toContain(
        "Questions address the specific prior knowledge outlined in the lesson plan",
      );
    });
  });

  describe("full prompt snapshots", () => {
    it("starter quiz prompt", () => {
      const prompt = buildCompositionPrompt(
        mockQuestionPools,
        mockLessonPlan,
        "/starterQuiz",
        FULL_REGEN,
      );

      expect(prompt).toMatchSnapshot();
    });

    it("exit quiz prompt", () => {
      const prompt = buildCompositionPrompt(
        mockQuestionPools,
        mockLessonPlan,
        "/exitQuiz",
        FULL_REGEN,
      );

      expect(prompt).toMatchSnapshot();
    });
  });

  describe("currentQuiz source type", () => {
    const currentQuizPool: QuizQuestionPool = {
      source: {
        type: "currentQuiz",
        quizType: "/exitQuiz",
      },
      questions: [
        mockMultipleChoice("CURRENT-Q1", "Existing question 1"),
        mockMultipleChoice("CURRENT-Q2", "Existing question 2"),
      ],
    };

    it("should include currentQuiz explanation when present", () => {
      const pools: QuizQuestionPool[] = [
        currentQuizPool,
        {
          source: { type: "semanticSearch", semanticQuery: "test" },
          questions: [mockMultipleChoice("q1", "Test question")],
        },
      ];

      const prompt = buildCompositionPrompt(pools, mockLessonPlan, "/exitQuiz", FULL_REGEN);

      expect(prompt).toContain("**Current Quiz (Being Modified)**");
      expect(prompt).toContain("CURRENT-Q1 through CURRENT-Q6");
      expect(prompt).toContain("they mean CURRENT-Q4");
    });

    it("should NOT include currentQuiz explanation when absent", () => {
      const pools: QuizQuestionPool[] = [
        {
          source: { type: "semanticSearch", semanticQuery: "test" },
          questions: [mockMultipleChoice("q1", "Test question")],
        },
      ];

      const prompt = buildCompositionPrompt(pools, mockLessonPlan, "/exitQuiz", FULL_REGEN);

      expect(prompt).not.toContain("Current Quiz");
      expect(prompt).not.toContain("CURRENT-Q");
    });

    it("should use correct pool header for currentQuiz", () => {
      const pools: QuizQuestionPool[] = [currentQuizPool];

      const prompt = buildCompositionPrompt(pools, mockLessonPlan, "/exitQuiz", FULL_REGEN);

      expect(prompt).toContain("### Current Quiz (To Be Modified)");
    });

    it("should NOT include currentQuiz explanation when pool is empty", () => {
      const emptyCurrentQuizPool: QuizQuestionPool = {
        source: {
          type: "currentQuiz",
          quizType: "/exitQuiz",
        },
        questions: [],
      };

      const pools: QuizQuestionPool[] = [
        emptyCurrentQuizPool,
        {
          source: { type: "semanticSearch", semanticQuery: "test" },
          questions: [mockMultipleChoice("q1", "Test question")],
        },
      ];

      const prompt = buildCompositionPrompt(pools, mockLessonPlan, "/exitQuiz", FULL_REGEN);

      expect(prompt).not.toContain("**Current Quiz (Being Modified)**");
    });
  });

  describe("single-question modes", () => {
    const currentQuizPool: QuizQuestionPool = {
      source: { type: "currentQuiz", quizType: "/exitQuiz" },
      questions: [
        mockMultipleChoice("CURRENT-Q1", "Existing question 1"),
        mockMultipleChoice("CURRENT-Q2", "Existing question 2"),
        mockMultipleChoice("CURRENT-Q3", "Existing question 3"),
      ],
    };
    const candidatePool: QuizQuestionPool = {
      source: { type: "semanticSearch", semanticQuery: "fractions" },
      questions: [mockMultipleChoice("cand-1", "Candidate question")],
    };

    describe("addOne mode", () => {
      it("instructs the model to select exactly one question", () => {
        const prompt = buildCompositionPrompt(
          [currentQuizPool, candidatePool],
          mockLessonPlan,
          "/exitQuiz",
          ADD_ONE,
        );

        expect(prompt).toContain("Select ONE additional question");
      });

      it("forbids selecting any CURRENT-Q* UID", () => {
        const prompt = buildCompositionPrompt(
          [currentQuizPool, candidatePool],
          mockLessonPlan,
          "/exitQuiz",
          ADD_ONE,
        );

        expect(prompt).toContain("Do not select any UID labelled CURRENT-Q");
      });

      it("does not include the 'select 6 questions' output instruction", () => {
        const prompt = buildCompositionPrompt(
          [currentQuizPool, candidatePool],
          mockLessonPlan,
          "/exitQuiz",
          ADD_ONE,
        );

        expect(prompt).not.toContain("Select 6 questions");
      });
    });

    describe("rewriteOne mode", () => {
      it("names the position being replaced", () => {
        const prompt = buildCompositionPrompt(
          [currentQuizPool, candidatePool],
          mockLessonPlan,
          "/exitQuiz",
          REWRITE_ONE(2),
        );

        expect(prompt).toContain("CURRENT-Q2");
        expect(prompt).toContain("Select ONE replacement");
      });

      it("forbids selecting any CURRENT-Q* UID", () => {
        const prompt = buildCompositionPrompt(
          [currentQuizPool, candidatePool],
          mockLessonPlan,
          "/exitQuiz",
          REWRITE_ONE(2),
        );

        expect(prompt).toContain("Do not select any UID labelled CURRENT-Q");
      });

      it("does not include the 'select 6 questions' output instruction", () => {
        const prompt = buildCompositionPrompt(
          [currentQuizPool, candidatePool],
          mockLessonPlan,
          "/exitQuiz",
          REWRITE_ONE(2),
        );

        expect(prompt).not.toContain("Select 6 questions");
      });
    });
  });
});

describe("buildCompositionResponseSchema", () => {
  it("fullRegen allows 1-6 selected questions", () => {
    const schema = buildCompositionResponseSchema(FULL_REGEN, false);
    const success = {
      status: "success" as const,
      success: {
        overallStrategy: "x",
        selectedQuestions: Array.from({ length: 6 }, (_, i) => ({
          questionUid: `q${i}`,
          reasoning: "r",
        })),
      },
      bail: null,
    };

    expect(schema.safeParse(success).success).toBe(true);
  });

  it("fullRegen rejects more than 6 selected questions", () => {
    const schema = buildCompositionResponseSchema(FULL_REGEN, false);
    const tooMany = {
      status: "success" as const,
      success: {
        overallStrategy: "x",
        selectedQuestions: Array.from({ length: 7 }, (_, i) => ({
          questionUid: `q${i}`,
          reasoning: "r",
        })),
      },
      bail: null,
    };

    expect(schema.safeParse(tooMany).success).toBe(false);
  });

  it("addOne accepts exactly one selected question", () => {
    const schema = buildCompositionResponseSchema(ADD_ONE, true);
    const one = {
      status: "success" as const,
      success: {
        overallStrategy: "x",
        selectedQuestions: [{ questionUid: "q0", reasoning: "r" }],
      },
      bail: null,
    };

    expect(schema.safeParse(one).success).toBe(true);
  });

  it("addOne rejects two selected questions", () => {
    const schema = buildCompositionResponseSchema(ADD_ONE, true);
    const two = {
      status: "success" as const,
      success: {
        overallStrategy: "x",
        selectedQuestions: [
          { questionUid: "q0", reasoning: "r" },
          { questionUid: "q1", reasoning: "r" },
        ],
      },
      bail: null,
    };

    expect(schema.safeParse(two).success).toBe(false);
  });

  it("rewriteOne accepts exactly one selected question", () => {
    const schema = buildCompositionResponseSchema(REWRITE_ONE(2), true);
    const one = {
      status: "success" as const,
      success: {
        overallStrategy: "x",
        selectedQuestions: [{ questionUid: "q0", reasoning: "r" }],
      },
      bail: null,
    };

    expect(schema.safeParse(one).success).toBe(true);
  });

  it("rewriteOne rejects two selected questions", () => {
    const schema = buildCompositionResponseSchema(REWRITE_ONE(2), true);
    const two = {
      status: "success" as const,
      success: {
        overallStrategy: "x",
        selectedQuestions: [
          { questionUid: "q0", reasoning: "r" },
          { questionUid: "q1", reasoning: "r" },
        ],
      },
      bail: null,
    };

    expect(schema.safeParse(two).success).toBe(false);
  });
});
