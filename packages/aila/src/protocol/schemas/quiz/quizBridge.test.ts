import { describe, expect, it } from "vitest";

import type { QuizV1, QuizV1Question, QuizV2Question } from ".";
import {
  convertQuizV1QuestionToV2,
  convertQuizV1ToV2,
  convertQuizV2QuestionToV1,
  convertQuizV2ToV1,
  createMultipleChoiceQuestionV2,
  createShortAnswerQuestionV2,
  detectQuizVersion,
  ensureQuizV1Compatible,
  ensureQuizV2Compatible,
  getQuizForContext,
  getQuizTypeStatistics,
  isV1Compatible,
} from "./quizBridge";

describe("Quiz Schema Bridge", () => {
  describe("V1 to V2 conversion", () => {
    it("should convert a V1 multiple choice question to V2", () => {
      const questionV1: QuizV1Question = {
        question: "What is 2 + 2?",
        answers: ["4"],
        distractors: ["3", "5"],
      };

      const result = convertQuizV1QuestionToV2(questionV1);

      expect(result).toEqual({
        questionType: "multiple-choice",
        questionStem: "What is 2 + 2?",
        answers: ["4"],
        distractors: ["3", "5"],
        feedback: undefined,
        hint: undefined,
      });
    });

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

      expect(result).toHaveLength(2);
      expect(result[0]?.questionType).toBe("multiple-choice");
      expect(result[1]?.questionType).toBe("multiple-choice");
    });
  });

  describe("V2 to V1 conversion", () => {
    it("should convert a V2 multiple choice question back to V1", () => {
      const questionV2: QuizV2Question = {
        questionType: "multiple-choice",
        questionStem: "What is 2 + 2?",
        answers: ["4"],
        distractors: ["3", "5"],
        feedback: "Great job!",
        hint: "Think about basic addition",
      };

      const result = convertQuizV2QuestionToV1(questionV2);

      expect(result).toEqual({
        question: "What is 2 + 2?",
        answers: ["4"],
        distractors: ["3", "5"],
      });
    });

    it("should convert a V2 short answer question to V1 with placeholder distractors", () => {
      const questionV2: QuizV2Question = {
        questionType: "short-answer",
        questionStem: "Name the capital of France",
        answers: ["Paris", "paris"],
      };

      const result = convertQuizV2QuestionToV1(questionV2);

      expect(result).toEqual({
        question: "Name the capital of France",
        answers: ["Paris", "paris"],
        distractors: ["N/A", "N/A"],
      });
    });

    it("should convert a V2 match question to V1 with combined answers", () => {
      const questionV2: QuizV2Question = {
        questionType: "match",
        questionStem: "Match the countries to their capitals",
        pairs: [
          { left: "France", right: "Paris" },
          { left: "Germany", right: "Berlin" },
        ],
      };

      const result = convertQuizV2QuestionToV1(questionV2);

      expect(result.question).toBe("Match the countries to their capitals");
      expect(result.answers[0]).toContain("France → Paris");
      expect(result.answers[0]).toContain("Germany → Berlin");
    });
  });

  describe("Helper functions", () => {
    it("should create a V2 multiple choice question", () => {
      const result = createMultipleChoiceQuestionV2(
        "What is 2 + 2?",
        ["4"],
        ["3", "5"],
        "Correct!",
        "Add them up",
      );

      expect(result.questionType).toBe("multiple-choice");
      expect(result.feedback).toBe("Correct!");
      expect(result.hint).toBe("Add them up");
    });

    it("should create a V2 short answer question", () => {
      const result = createShortAnswerQuestionV2("Name a primary color", [
        "red",
        "blue",
        "yellow",
      ]);

      expect(result.questionType).toBe("short-answer");
      expect(result.answers).toEqual(["red", "blue", "yellow"]);
    });

    it("should calculate quiz type statistics", () => {
      const quiz = [
        createMultipleChoiceQuestionV2("Q1", ["A"], ["B", "C"]),
        createMultipleChoiceQuestionV2("Q2", ["A"], ["B", "C"]),
        createShortAnswerQuestionV2("Q3", ["A"]),
      ];

      const stats = getQuizTypeStatistics(quiz);

      expect(stats["multiple-choice"]).toBe(2);
      expect(stats["short-answer"]).toBe(1);
    });

    it("should check V1 compatibility", () => {
      const compatibleQuiz = [
        createMultipleChoiceQuestionV2("Q1", ["A"], ["B", "C"]),
        createMultipleChoiceQuestionV2("Q2", ["A"], ["B", "C"]),
      ];

      const incompatibleQuiz = [
        createMultipleChoiceQuestionV2("Q1", ["A"], ["B", "C"]),
        createShortAnswerQuestionV2("Q2", ["A"]),
      ];

      expect(isV1Compatible(compatibleQuiz)).toBe(true);
      expect(isV1Compatible(incompatibleQuiz)).toBe(false);
    });
  });

  describe("Round-trip conversion", () => {
    it("should maintain data integrity for MC questions through round-trip conversion", () => {
      const originalV1: QuizV1Question = {
        question: "What is 2 + 2?",
        answers: ["4"],
        distractors: ["3", "5"],
      };

      const v2 = convertQuizV1QuestionToV2(originalV1);
      const backToV1 = convertQuizV2QuestionToV1(v2);

      expect(backToV1).toEqual(originalV1);
    });
  });

  describe("Backward compatibility", () => {
    it("should pass through V1 quiz when ensuring V1 compatibility", () => {
      const v1Quiz: QuizV1 = [
        {
          question: "What is 2 + 2?",
          answers: ["4"],
          distractors: ["3", "5"],
        },
      ];

      const result = ensureQuizV1Compatible(v1Quiz);
      expect(result).toEqual(v1Quiz);
    });

    it("should convert V2 quiz to V1 when ensuring V1 compatibility", () => {
      const v2Quiz = [
        createShortAnswerQuestionV2("Name a color", ["red", "blue"]),
      ];

      const result = ensureQuizV1Compatible(v2Quiz);
      expect(result[0]?.question).toBe("Name a color");
      expect(result[0]?.answers).toEqual(["red", "blue"]);
    });

    it("should pass through V2 quiz when ensuring V2 compatibility", () => {
      const v2Quiz = [createMultipleChoiceQuestionV2("Q1", ["A"], ["B", "C"])];

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
      expect(result[0]?.questionType).toBe("multiple-choice");
      expect(result[0]?.questionStem).toBe("What is 2 + 2?");
    });

    it("should correctly detect quiz versions", () => {
      const v1Quiz: QuizV1 = [
        { question: "Q1", answers: ["A"], distractors: ["B"] },
      ];
      const v2Quiz = [createMultipleChoiceQuestionV2("Q1", ["A"], ["B"])];

      expect(detectQuizVersion(v1Quiz)).toBe("v1");
      expect(detectQuizVersion(v2Quiz)).toBe("v2");
      expect(detectQuizVersion([])).toBe("unknown");
    });

    it("should return appropriate quiz format for different contexts", () => {
      const v1Quiz: QuizV1 = [
        { question: "Q1", answers: ["A"], distractors: ["B"] },
      ];
      const v2Quiz = [createShortAnswerQuestionV2("Q1", ["A"])];

      // LLM generation should always return V1-compatible format
      const llmResult = getQuizForContext("llm-generation", v1Quiz, v2Quiz);
      expect(detectQuizVersion(llmResult!)).toBe("v1");

      // Display should prefer V2 if available
      const displayResult = getQuizForContext("display", v1Quiz, v2Quiz);
      expect(detectQuizVersion(displayResult!)).toBe("v2");

      // With only V1 available, display should convert to V2
      const displayV1Only = getQuizForContext("display", v1Quiz);
      expect(detectQuizVersion(displayV1Only!)).toBe("v2");
    });

    it("should handle empty quizzes gracefully", () => {
      expect(ensureQuizV1Compatible([])).toEqual([]);
      expect(ensureQuizV2Compatible([])).toEqual([]);
      expect(detectQuizVersion([])).toBe("unknown");
      expect(getQuizForContext("display")).toBeUndefined();
    });
  });
});
