import type { PartialLessonPlan } from "../../../protocol/schema";
import type { QuizQuestionPool, RagQuizQuestion } from "../interfaces";
import { buildCompositionPrompt } from "./LLMQuizComposerPrompts";

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
  source: {} as RagQuizQuestion["source"],
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
  source: {} as RagQuizQuestion["source"],
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
  source: {} as RagQuizQuestion["source"],
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
  source: {} as RagQuizQuestion["source"],
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
        source: {} as RagQuizQuestion["source"],
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

      const prompt = buildCompositionPrompt(pools, mockLessonPlan, "/exitQuiz");

      expect(prompt).toContain(
        "[IMAGE: a right triangle with base 3cm and height 4cm]",
      );
      expect(prompt).not.toContain("![triangle](http://example.com/img.png)");
    });

    it("should leave images unchanged when no aiDescription", () => {
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
        source: {} as RagQuizQuestion["source"],
        imageMetadata: [
          {
            imageUrl: "http://example.com/img.png",
            attribution: null,
            width: 100,
            height: 100,
          },
        ],
      };

      const pools: QuizQuestionPool[] = [
        {
          source: { type: "semanticSearch", semanticQuery: "area" },
          questions: [questionWithImage],
        },
      ];

      const prompt = buildCompositionPrompt(pools, mockLessonPlan, "/exitQuiz");

      expect(prompt).toContain("![triangle](http://example.com/img.png)");
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
        source: {} as RagQuizQuestion["source"],
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

      const prompt = buildCompositionPrompt(pools, mockLessonPlan, "/exitQuiz");

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
      );

      expect(prompt).toMatchSnapshot();
    });

    it("exit quiz prompt", () => {
      const prompt = buildCompositionPrompt(
        mockQuestionPools,
        mockLessonPlan,
        "/exitQuiz",
      );

      expect(prompt).toMatchSnapshot();
    });
  });
});
