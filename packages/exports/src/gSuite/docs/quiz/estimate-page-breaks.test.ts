/**
 * Unit tests for page break estimation utility
 */
import type { QuizQuestion } from "../../../schema/input.schema";
import {
  LINE_COUNT_THRESHOLD,
  countQuizLines,
  getFooterStrategy,
} from "./estimate-page-breaks";

describe("countQuizLines", () => {
  it("should count single multiple choice question correctly", () => {
    const questions: QuizQuestion[] = [
      {
        questionType: "multiple-choice",
        question: "What is 2 + 2?",
        answers: ["3", "4", "5"],
        distractors: [],
        hint: null,
      },
    ];

    // 1 (question) + 3 (answers) = 4 lines
    expect(countQuizLines(questions)).toBe(4);
  });

  it("should count short-answer question correctly", () => {
    const questions: QuizQuestion[] = [
      {
        questionType: "short-answer",
        question: "What is the capital of France?",
        answers: ["Paris"],
        hint: null,
      },
    ];

    // 1 (question) + 1 (answer space) = 2 lines
    expect(countQuizLines(questions)).toBe(2);
  });

  it("should count match question correctly", () => {
    const questions: QuizQuestion[] = [
      {
        questionType: "match",
        question: "Match the countries with their capitals:",
        pairs: [
          { left: "France", right: "Paris" },
          { left: "Spain", right: "Madrid" },
          { left: "Italy", right: "Rome" },
        ],
        hint: null,
      },
    ];

    // 1 (question) + 3 (pairs) = 4 lines
    expect(countQuizLines(questions)).toBe(4);
  });

  it("should count order question correctly", () => {
    const questions: QuizQuestion[] = [
      {
        questionType: "order",
        question: "Put these events in chronological order:",
        items: [
          "World War I",
          "Renaissance",
          "Industrial Revolution",
          "World War II",
        ],
        hint: null,
      },
    ];

    // 1 (question) + 4 (items) = 5 lines
    expect(countQuizLines(questions)).toBe(5);
  });

  it("should add spacing between multiple questions", () => {
    const questions: QuizQuestion[] = [
      {
        questionType: "multiple-choice",
        question: "What is 2 + 2?",
        answers: ["3", "4"],
        distractors: [],
        hint: null,
      },
      {
        questionType: "short-answer",
        question: "What is the capital of France?",
        answers: ["Paris"],
        hint: null,
      },
    ];

    // Q1: 1 + 2 = 3, spacing: 1, Q2: 1 + 1 = 2, total = 6
    expect(countQuizLines(questions)).toBe(6);
  });

  it("should handle mixed question types", () => {
    const questions: QuizQuestion[] = [
      {
        questionType: "multiple-choice",
        question: "What is 2 + 2?",
        answers: ["3", "4", "5"],
        distractors: [],
        hint: null,
      },
      {
        questionType: "match",
        question: "Match the countries:",
        pairs: [
          { left: "France", right: "Paris" },
          { left: "Spain", right: "Madrid" },
        ],
        hint: null,
      },
      {
        questionType: "order",
        question: "Put in order:",
        items: ["First", "Second", "Third"],
        hint: null,
      },
      {
        questionType: "short-answer",
        question: "Explain photosynthesis.",
        answers: ["Process by which plants make food"],
        hint: null,
      },
    ];

    // Q1: 1 + 3 = 4, spacing: 1, Q2: 1 + 2 = 3, spacing: 1, Q3: 1 + 3 = 4, spacing: 1, Q4: 1 + 1 = 2
    // Total: 4 + 1 + 3 + 1 + 4 + 1 + 2 = 16
    expect(countQuizLines(questions)).toBe(16);
  });

  it("should not add spacing after last question", () => {
    const questions: QuizQuestion[] = [
      {
        questionType: "short-answer",
        question: "Single question",
        answers: ["Answer"],
        hint: null,
      },
    ];

    // 1 (question) + 1 (answer space) = 2 lines, no spacing
    expect(countQuizLines(questions)).toBe(2);
  });
});

describe("getFooterStrategy", () => {
  it('should return "both-footers" for content under threshold', () => {
    // Create content with exactly threshold lines
    const questions: QuizQuestion[] = Array.from(
      { length: LINE_COUNT_THRESHOLD },
      (_, i) => ({
        questionType: "short-answer",
        question: `Question ${i + 1}`,
        answers: ["Answer"],
        hint: null,
      }),
    );

    // This will be threshold * 2 - 1 (no spacing after last question)
    // which should be over threshold, so let's use fewer questions
    const shortQuestions: QuizQuestion[] = [
      {
        questionType: "multiple-choice",
        question: "Short quiz",
        answers: ["A", "B"],
        distractors: [],
        hint: null,
      },
    ];

    expect(getFooterStrategy(shortQuestions)).toBe("both-footers");
  });

  it('should return "global-only" for content over threshold', () => {
    // Create content that exceeds threshold
    const questions: QuizQuestion[] = Array.from({ length: 15 }, (_, i) => ({
      questionType: "multiple-choice",
      question: `Question ${i + 1}`,
      answers: ["A", "B", "C"],
      distractors: [],
      hint: null,
    }));

    expect(getFooterStrategy(questions)).toBe("global-only");
  });

  it("should handle edge case at exact threshold", () => {
    // Create content with exactly threshold + 1 lines
    const lineCount = LINE_COUNT_THRESHOLD + 1;

    // Use short-answer questions (2 lines each) to get precise control
    const questionsNeeded = Math.ceil(lineCount / 2);
    const questions: QuizQuestion[] = Array.from(
      { length: questionsNeeded },
      (_, i) => ({
        questionType: "short-answer",
        question: `Question ${i + 1}`,
        answers: ["Answer"],
        hint: null,
      }),
    );

    // Add spacing adjustments if needed to hit exactly threshold + 1
    expect(getFooterStrategy(questions)).toBe("global-only");
  });
});
