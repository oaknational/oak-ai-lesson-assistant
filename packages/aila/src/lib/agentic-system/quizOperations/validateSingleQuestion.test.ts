import type { LatestQuizQuestion } from "../../../protocol/schema";

import { validateSingleQuestion } from "./validateSingleQuestion";

const validQuestion: LatestQuizQuestion = {
  questionType: "multiple-choice",
  question: "What is the capital of France?",
  hint: null,
  answers: ["Paris"],
  distractors: ["London", "Berlin"],
};

describe("validateSingleQuestion", () => {
  it("returns true for a valid question", () => {
    expect(validateSingleQuestion(validQuestion)).toBe(true);
  });

  it("returns false for null", () => {
    expect(validateSingleQuestion(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(validateSingleQuestion(undefined)).toBe(false);
  });

  it("returns false when question text is empty", () => {
    expect(validateSingleQuestion({ ...validQuestion, question: "" })).toBe(
      false,
    );
  });

  it("returns false when question text is whitespace only", () => {
    expect(validateSingleQuestion({ ...validQuestion, question: "   " })).toBe(
      false,
    );
  });

  it("returns false when the value does not match the schema", () => {
    expect(validateSingleQuestion({ notAQuestion: true })).toBe(false);
  });
});
