import type { OakLessonQuiz } from "../zod-schema/zodSchema";
import { transformQuiz } from "./transformQuiz";

describe("transformQuiz", () => {
  it("transforms an OakLessonQuiz into a Quiz", () => {
    const oakQuiz: OakLessonQuiz = [
      {
        questionType: "multiple-choice",
        questionStem: [
          { type: "text", text: "What is the capital of France?" },
        ],
        answers: {
          "multiple-choice": [
            {
              answer: [{ type: "text", text: "Paris" }],
              answer_is_correct: true,
            },
            {
              answer: [{ type: "text", text: "London" }],
              answer_is_correct: false,
            },
            {
              answer: [{ type: "text", text: "Berlin" }],
              answer_is_correct: false,
            },
          ],
        },
      },
      {
        questionType: "multiple-choice",
        questionStem: [
          { type: "text", text: "What is the capital of Germany?" },
        ],
        answers: {
          "multiple-choice": [
            {
              answer: [{ type: "text", text: "Paris" }],
              answer_is_correct: false,
            },
            {
              answer: [{ type: "text", text: "London" }],
              answer_is_correct: false,
            },
            {
              answer: [{ type: "text", text: "Berlin" }],
              answer_is_correct: true,
            },
          ],
        },
      },
    ];

    const quiz = transformQuiz(oakQuiz);

    expect(quiz).toEqual([
      {
        question: "What is the capital of France?",
        answers: ["Paris"],
        distractors: ["London", "Berlin"],
      },
      {
        question: "What is the capital of Germany?",
        answers: ["Berlin"],
        distractors: ["Paris", "London"],
      },
    ]);
  });
});
