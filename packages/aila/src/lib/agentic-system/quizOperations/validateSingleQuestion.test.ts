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
});
