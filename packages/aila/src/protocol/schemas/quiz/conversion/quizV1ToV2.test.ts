import { describe, expect, it } from "@jest/globals";

import type { QuizV1, QuizV1Question } from "..";
import {
  convertQuizV1QuestionToV2,
  convertQuizV1ToV2,
  detectQuizVersion,
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
        question: "What is 2 + 2?",
        answers: ["4"],
        distractors: ["3", "5"],
        hint: undefined,
        imageAttributions: [],
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
            question: "Q1",
            answers: ["A"],
            distractors: ["B"],
            hint: undefined,
            imageAttributions: [],
          },
        ],
      };

      expect(detectQuizVersion(v1Quiz)).toBe("v1");
      expect(detectQuizVersion(v2Quiz)).toBe("v2");
      expect(detectQuizVersion([])).toBe("v1"); // Empty array is still V1 format
    });
  });
});
