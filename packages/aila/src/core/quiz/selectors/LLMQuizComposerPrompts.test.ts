import type { PartialLessonPlan } from "../../../protocol/schema";
import type { QuizQuestionPool, QuizQuestionWithSourceData } from "../interfaces";
import { buildCompositionPrompt } from "./LLMQuizComposerPrompts";

const mockQuestion = (
  uid: string,
  questionText: string,
): QuizQuestionWithSourceData => ({
  question: questionText,
  answers: ["Correct answer 1", "Correct answer 2"],
  distractors: ["Wrong answer 1", "Wrong answer 2", "Wrong answer 3"],
  sourceUid: uid,
  source: {} as QuizQuestionWithSourceData["source"],
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
      type: "mlSemanticSearch",
      semanticQuery: "adding fractions with different denominators",
    },
    questions: [
      mockQuestion("q1", "What is 1/2 + 1/4?"),
      mockQuestion("q2", "Find the sum of 2/3 and 1/6"),
    ],
  },
  {
    source: {
      type: "basedOn",
      lessonPlanId: "lesson-123",
      lessonTitle: "Introduction to Fractions",
    },
    questions: [mockQuestion("q3", "Which fraction is equivalent to 2/4?")],
  },
];

describe("buildCompositionPrompt", () => {
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
