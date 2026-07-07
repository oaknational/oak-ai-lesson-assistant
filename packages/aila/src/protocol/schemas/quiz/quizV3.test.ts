import {
  QUIZ_MAX_QUESTIONS,
  QuizV3MultipleChoiceOnlyStrictMax6Schema,
  QuizV3Schema,
} from "./quizV3";

const mcQuestion = (overrides: Record<string, unknown> = {}) => ({
  questionType: "multiple-choice",
  question: "What is 1+1?",
  hint: null,
  answers: ["2"],
  distractors: ["1", "3"],
  ...overrides,
});

const strictQuiz = (questions: unknown[]) => ({
  version: "v3",
  questions,
  imageMetadata: [],
});

describe("QuizV3MultipleChoiceOnlyStrictMax6Schema", () => {
  it("accepts a full quiz of questions with one answer and two distractors", () => {
    const quiz = strictQuiz(
      Array.from({ length: QUIZ_MAX_QUESTIONS }, () => mcQuestion()),
    );

    expect(
      QuizV3MultipleChoiceOnlyStrictMax6Schema.safeParse(quiz).success,
    ).toBe(true);
  });

  it("rejects a question with a third distractor", () => {
    const quiz = strictQuiz([mcQuestion({ distractors: ["1", "3", "4"] })]);

    expect(
      QuizV3MultipleChoiceOnlyStrictMax6Schema.safeParse(quiz).success,
    ).toBe(false);
  });

  it("rejects a question with two correct answers", () => {
    const quiz = strictQuiz([mcQuestion({ answers: ["2", "two"] })]);

    expect(
      QuizV3MultipleChoiceOnlyStrictMax6Schema.safeParse(quiz).success,
    ).toBe(false);
  });

  it("rejects a question with a single distractor", () => {
    const quiz = strictQuiz([mcQuestion({ distractors: ["1"] })]);

    expect(
      QuizV3MultipleChoiceOnlyStrictMax6Schema.safeParse(quiz).success,
    ).toBe(false);
  });

  it("rejects a quiz with more questions than the maximum", () => {
    const quiz = strictQuiz(
      Array.from({ length: QUIZ_MAX_QUESTIONS + 1 }, () => mcQuestion()),
    );

    expect(
      QuizV3MultipleChoiceOnlyStrictMax6Schema.safeParse(quiz).success,
    ).toBe(false);
  });

  it("rejects an empty quiz", () => {
    expect(
      QuizV3MultipleChoiceOnlyStrictMax6Schema.safeParse(strictQuiz([]))
        .success,
    ).toBe(false);
  });

  it("rejects non-multiple-choice question types", () => {
    const quiz = strictQuiz([
      {
        questionType: "short-answer",
        question: "Name a prime number.",
        hint: null,
        answers: ["2"],
      },
    ]);

    expect(
      QuizV3MultipleChoiceOnlyStrictMax6Schema.safeParse(quiz).success,
    ).toBe(false);
  });
});

// This tests the schema for persisted quizzes we already hold: lessons saved
// in the database, basedOn/RAG quizzes and maths-bank questions. These can
// have shapes the LLM is not allowed to produce, so it must keep accepting them.
describe("QuizV3Schema (persisted)", () => {
  it("still accepts questions with four answer options", () => {
    const quiz = strictQuiz([mcQuestion({ distractors: ["1", "3", "4"] })]);

    expect(QuizV3Schema.safeParse(quiz).success).toBe(true);
  });

  it("still accepts non-multiple-choice question types", () => {
    const quiz = strictQuiz([
      {
        questionType: "match",
        question: "Match the halves.",
        hint: null,
        pairs: [{ left: "1/2", right: "0.5" }],
      },
    ]);

    expect(QuizV3Schema.safeParse(quiz).success).toBe(true);
  });
});
