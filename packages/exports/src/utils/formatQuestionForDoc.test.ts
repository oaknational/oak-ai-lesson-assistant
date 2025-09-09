import dedent from "dedent";

import type { QuizQAD, QuizV2Question } from "../schema/input.schema";
import {
  formatLegacyQuestionForDoc,
  formatQuestionForDoc,
} from "./formatQuestionForDoc";

describe("formatQuestionForDoc", () => {
  it("formats multiple-choice questions correctly", () => {
    const question: QuizV2Question = {
      questionType: "multiple-choice",
      question: "What is 2 + 2?",
      answers: ["4"],
      distractors: ["3", "5"],
      hint: null,
    };

    const result = formatQuestionForDoc(question, 1);

    expect(result).toEqual(dedent`
      1. What is 2 + 2?
        a) 3
        b) 4 ✓
        c) 5
    `);
  });

  it("formats multiple-choice questions with blanks correctly", () => {
    const question: QuizV2Question = {
      questionType: "multiple-choice",
      question: "The formula for water is {{ }}.",
      answers: ["H2O"],
      distractors: ["CO2", "NaCl"],
      hint: null,
    };

    const result = formatQuestionForDoc(question, 2);

    expect(result).toContain("2. The formula for water is ▁▁▁▁▁▁▁▁▁▁.");
    expect(result).toContain("H2O ✓");
    expect(result).toContain("CO2");
    expect(result).toContain("NaCl");
  });

  it("formats short-answer questions correctly", () => {
    const question: QuizV2Question = {
      questionType: "short-answer",
      question: "What is the capital of France?",
      answers: ["Paris"],
      hint: null,
    };

    const result = formatQuestionForDoc(question, 2);

    expect(result).toEqual(dedent`
      2. What is the capital of France?
        ▁▁▁▁▁▁▁▁▁▁
    `);
  });

  it("formats short-answer questions with inline blanks correctly", () => {
    const question: QuizV2Question = {
      questionType: "short-answer",
      question: "The capital of France is ___.",
      answers: ["Paris"],
      hint: null,
    };

    const result = formatQuestionForDoc(question, 3);

    expect(result).toEqual("3. The capital of France is ▁▁▁▁▁▁▁▁▁▁.");
  });

  it("formats matching questions correctly", () => {
    const question: QuizV2Question = {
      questionType: "match",
      question: "Match the countries to their capitals:",
      pairs: [
        { left: "France", right: "Paris" },
        { left: "Germany", right: "Berlin" },
        { left: "Spain", right: "Madrid" },
      ],
      hint: null,
    };

    const result = formatQuestionForDoc(question, 3);

    expect(result).toEqual(dedent`
      3. Match the countries to their capitals:
        1. France          A. Paris
        2. Germany         B. Berlin
        3. Spain           C. Madrid
    `);
  });

  it("formats ordering questions correctly", () => {
    const question: QuizV2Question = {
      questionType: "order",
      question: "Put these events in chronological order:",
      items: ["World War II ends", "Moon landing", "Fall of Berlin Wall"],
      hint: null,
    };

    const result = formatQuestionForDoc(question, 4);

    expect(result).toEqual(dedent`
      4. Put these events in chronological order:
        • Fall of Berlin Wall
        • World War II ends
        • Moon landing
    `);
  });

  it("handles empty matching pairs", () => {
    const question: QuizV2Question = {
      questionType: "match",
      question: "Match the items:",
      pairs: [],
      hint: null,
    };

    const result = formatQuestionForDoc(question, 1);

    expect(result).toEqual(
      "1. Match the items:\n" + "(No matching pairs provided)",
    );
  });

  it("handles empty ordering items", () => {
    const question: QuizV2Question = {
      questionType: "order",
      question: "Put these in order:",
      items: [],
      hint: null,
    };

    const result = formatQuestionForDoc(question, 1);

    expect(result).toEqual("1. Put these in order:\n" + "(No items provided)");
  });
});

describe("formatLegacyQuestionForDoc", () => {
  it("formats legacy QAD questions correctly", () => {
    const question: QuizQAD = {
      question: "What is 5 + 3?",
      answers: ["8"],
      distractors: ["7", "9", "10"],
    };

    const result = formatLegacyQuestionForDoc(question, 5);

    expect(result).toEqual(
      "5. What is 5 + 3?\n" +
        "  a) 7\n" +
        "  b) 8 ✓\n" +
        "  c) 9\n" +
        "  d) 10",
    );
  });

  it("handles multiple correct answers", () => {
    const question: QuizQAD = {
      question: "Which are prime numbers?",
      answers: ["2", "3"],
      distractors: ["1", "4"],
    };

    const result = formatLegacyQuestionForDoc(question, 1);

    expect(result).toEqual(
      "1. Which are prime numbers?\n" +
        "  a) 1\n" +
        "  b) 2 ✓\n" +
        "  c) 3 ✓\n" +
        "  d) 4",
    );
  });
});
