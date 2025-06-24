import { describe, expect, it } from "vitest";

import type { QuizV1, QuizV1Question } from "..";
import {
  convertQuizV1QuestionToV2,
  convertQuizV1ToV2,
  detectQuizVersion,
  ensureQuizV2Compatible,
} from "./quizV1ToV2";

describe("V1 to V2 Quiz Conversion", () => {
  describe("Question conversion", () => {
    it("should convert a V1 multiple choice question to V2", () => {
      const questionV1: QuizV1Question = {
        question: "What is 2 + 2?",
        answers: ["4"],
        distractors: ["3", "5"],
      };

      const result = convertQuizV1QuestionToV2(questionV1);

      expect(result).toEqual({
        questionType: "multiple-choice",
        questionStem: [{ type: "text" as const, text: "What is 2 + 2?" }],
        answers: [[{ type: "text" as const, text: "4" }]],
        distractors: [[{ type: "text" as const, text: "3" }], [{ type: "text" as const, text: "5" }]],
        feedback: undefined,
        hint: undefined,
      });
    });
  });

  describe("Quiz conversion", () => {
    it("should convert an entire V1 quiz to V2", () => {
      const quizV1: QuizV1 = [
        {
          question: "What is 2 + 2?",
          answers: ["4"],
          distractors: ["3", "5"],
        },
        {
          question: "What is the capital of France?",
          answers: ["Paris"],
          distractors: ["London", "Berlin"],
        },
      ];

      const result = convertQuizV1ToV2(quizV1);

      expect(result.version).toBe("v2");
      expect(result.questions).toHaveLength(2);
      expect(result.questions[0]?.questionType).toBe("multiple-choice");
      expect(result.questions[1]?.questionType).toBe("multiple-choice");
    });
  });

  describe("Version detection", () => {
    it("should correctly detect quiz versions", () => {
      const v1Quiz: QuizV1 = [
        { question: "Q1", answers: ["A"], distractors: ["B"] },
      ];
      const v2Quiz = {
        version: "v2" as const,
        questions: [
          {
            questionType: "multiple-choice" as const,
            questionStem: [{ type: "text" as const, text: "Q1" }],
            answers: [[{ type: "text" as const, text: "A" }]],
            distractors: [[{ type: "text" as const, text: "B" }]],
            feedback: undefined,
            hint: undefined,
          },
        ],
      };

      expect(detectQuizVersion(v1Quiz)).toBe("v1");
      expect(detectQuizVersion(v2Quiz)).toBe("v2");
      expect(detectQuizVersion([])).toBe("unknown");
    });
  });


  describe("Backward compatibility", () => {
    it("should pass through V2 quiz when ensuring V2 compatibility", () => {
      const v2Quiz = {
        version: "v2" as const,
        questions: [
          {
            questionType: "multiple-choice" as const,
            questionStem: [{ type: "text" as const, text: "Q1" }],
            answers: [[{ type: "text" as const, text: "A" }]],
            distractors: [[{ type: "text" as const, text: "B" }], [{ type: "text" as const, text: "C" }]],
            feedback: undefined,
            hint: undefined,
          },
        ],
      };

      const result = ensureQuizV2Compatible(v2Quiz);
      expect(result).toEqual(v2Quiz);
    });

    it("should convert V1 quiz to V2 when ensuring V2 compatibility", () => {
      const v1Quiz: QuizV1 = [
        {
          question: "What is 2 + 2?",
          answers: ["4"],
          distractors: ["3", "5"],
        },
      ];

      const result = ensureQuizV2Compatible(v1Quiz);
      expect(result.questions[0]?.questionType).toBe("multiple-choice");
      expect(result.questions[0]?.questionStem).toEqual([{ type: "text" as const, text: "What is 2 + 2?" }]);
    });

    it("should handle empty quizzes gracefully", () => {
      expect(ensureQuizV2Compatible([])).toEqual({ version: "v2", questions: [] });
      expect(detectQuizVersion([])).toBe("unknown");
    });
  });
});