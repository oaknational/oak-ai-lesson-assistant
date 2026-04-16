import { type QuizQuestion as OwaQuizQuestion } from "@oaknational/oak-curriculum-schema/";

import { transformQuiz } from "./transformer";

describe("transformQuiz", () => {
  it("should include questions with all text-type stems and answers", () => {
    const validQuestions: OwaQuizQuestion[] = [
      {
        question_id: 1,
        order: 1,
        question_uid: "q1",
        question_type: "multiple-choice",
        question_stem: [{ type: "text", text: "What is 2 + 2?" }],
        answers: {
          "multiple-choice": [
            {
              answer: [{ type: "text", text: "4" }],
              answer_is_correct: true,
            },
            {
              answer: [{ type: "text", text: "3" }],
              answer_is_correct: false,
            },
          ],
        },
      },
    ];

    const result = transformQuiz(validQuestions);

    if (!result.questions || !result.questions[0]?.question) {
      throw new Error("No valid questions found in the result");
    }

    expect(result.questions).toHaveLength(1);
    expect(result.questions[0].question).toBe("What is 2 + 2?");

    // Type assertion to access multiple-choice specific properties
    const mcQuestion = result.questions[0];
    if (mcQuestion.questionType === "multiple-choice") {
      expect(mcQuestion.answers).toEqual(["4"]);
      expect(mcQuestion.distractors).toEqual(["3"]);
    } else {
      throw new Error("Expected multiple-choice question");
    }
  });

  it("should omit questions with non-text type in question stem", () => {
    const questionsWithNonTextStem: OwaQuizQuestion[] = [
      {
        question_id: 1,
        question_uid: "q1",
        question_type: "multiple-choice",
        question_stem: [
          { type: "text", text: "Look at this image: " },
          {
            type: "image",
            image_object: {
              secure_url: "https://example.com/image.png",
              metadata: [],
              public_id: "example-image",
            },
          },
        ],
        answers: {
          "multiple-choice": [
            {
              answer: [{ type: "text", text: "4" }],
              answer_is_correct: true,
            },
          ],
        },
        order: 1,
      },
      {
        question_id: 2,
        question_uid: "q2",
        question_type: "multiple-choice",
        question_stem: [{ type: "text", text: "Valid question?" }],
        answers: {
          "multiple-choice": [
            {
              answer: [{ type: "text", text: "Yes" }],
              answer_is_correct: true,
            },
          ],
        },
        order: 2,
      },
    ];

    const result = transformQuiz(questionsWithNonTextStem);

    if (!result.questions || !result.questions[0]?.question) {
      throw new Error("No valid questions found in the result");
    }

    // Should only include the second question (valid one)
    expect(result.questions).toHaveLength(1);
    expect(result.questions[0].question).toBe("Valid question?");
  });

  it("should omit questions with non-text type in answers (multiple-choice)", () => {
    const questionsWithNonTextAnswers: OwaQuizQuestion[] = [
      {
        question_id: 1,
        question_uid: "q1",
        question_type: "multiple-choice",
        question_stem: [{ type: "text", text: "What do you see?" }],
        answers: {
          "multiple-choice": [
            {
              answer: [
                { type: "text", text: "A cat" },
                {
                  type: "image",
                  image_object: {
                    secure_url: "https://example.com/image.png",
                    metadata: [],
                    public_id: "example-image",
                  },
                },
              ],
              answer_is_correct: true,
            },
            {
              answer: [{ type: "text", text: "A dog" }],
              answer_is_correct: false,
            },
          ],
        },
        order: 1,
      },
      {
        question_id: 2,
        question_uid: "q2",
        question_type: "multiple-choice",
        question_stem: [{ type: "text", text: "Valid question?" }],
        answers: {
          "multiple-choice": [
            {
              answer: [{ type: "text", text: "Yes" }],
              answer_is_correct: true,
            },
          ],
        },
        order: 2,
      },
    ];

    const result = transformQuiz(questionsWithNonTextAnswers);

    if (!result.questions || !result.questions[0]?.question) {
      throw new Error("No valid questions found in the result");
    }

    // Should only include the second question (valid one)
    expect(result.questions).toHaveLength(1);
    expect(result.questions[0].question).toBe("Valid question?");
  });

  it("should omit questions with non-text type in answers (short-answer)", () => {
    const questionsWithNonTextShortAnswers: OwaQuizQuestion[] = [
      {
        question_id: 1,
        question_uid: "q1",
        question_type: "short-answer",
        question_stem: [{ type: "text", text: "Describe this image:" }],
        answers: {
          "short-answer": [
            {
              answer: [
                { type: "text", text: "It shows" },
                {
                  type: "image",
                  image_object: {
                    secure_url: "https://example.com/image.png",
                    metadata: [],
                    public_id: "example-image",
                  },
                },
              ],
              answer_is_default: true,
            },
          ],
        },
        order: 1,
      },

      {
        question_id: 1,
        question_uid: "q1",
        question_type: "short-answer",
        question_stem: [{ type: "text", text: "What is water?" }],
        answers: {
          "short-answer": [
            {
              answer: [{ type: "text", text: "H2O" }],
              answer_is_default: true,
            },
          ],
        },
        order: 2,
      },
    ];

    const result = transformQuiz(questionsWithNonTextShortAnswers);

    if (!result.questions || !result.questions[0]?.question) {
      throw new Error("No valid questions found in the result");
    }

    // Should only include the second question (valid one)
    expect(result.questions).toHaveLength(1);
    expect(result.questions[0].question).toBe("What is water?");
  });

  it("should handle mixed text and non-text stems correctly", () => {
    const mixedQuestions: OwaQuizQuestion[] = [
      {
        question_id: 1,
        question_uid: "q1",
        question_type: "multiple-choice",
        question_stem: [
          { type: "text", text: "Part 1" },
          // @ts-expect-error: 'video' is not assignable to 'text' | 'image'
          { type: "video", text: "video.mp4" },
          { type: "text", text: "Part 2" },
        ],
        answers: {
          "multiple-choice": [
            {
              answer: [{ type: "text", text: "Answer" }],
              answer_is_correct: true,
            },
          ],
        },
      },
    ];

    const result = transformQuiz(mixedQuestions);

    // Should omit the question due to non-text video type
    expect(result.questions).toHaveLength(0);
  });

  it("should handle empty or malformed input gracefully", () => {
    expect(transformQuiz([])).toEqual({
      version: "v3",
      imageMetadata: [],
      questions: [],
    });
  });

  it("should handle questions with unsupported question types", () => {
    const unsupportedTypeQuestion: OwaQuizQuestion[] = [
      {
        question_id: 1,
        question_uid: "q1",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        question_type: "essay" as any,
        question_stem: [{ type: "text", text: "Write an essay about..." }],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        answers: {} as any,
        order: 1,
      },
    ];

    const result = transformQuiz(unsupportedTypeQuestion);

    // Should include the question but with fallback structure
    expect(result.questions).toHaveLength(0);
  });

  it("should handle questions where answers array contains items with missing text properties", () => {
    const questionsWithMissingProps: OwaQuizQuestion[] = [
      {
        question_id: 1,
        question_uid: "q1",
        question_type: "multiple-choice",
        question_stem: [{ type: "text", text: "What is the answer?" }],
        answers: {
          "multiple-choice": [
            {
              answer: [
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                { type: "text", text: undefined as any },
                { type: "text", text: "Valid text" },
              ],
              answer_is_correct: true,
            },
          ],
        },
        order: 1,
      },
    ];

    const result = transformQuiz(questionsWithMissingProps);

    // Should still include the question and handle undefined text gracefully
    expect(result.questions).toHaveLength(1);

    if (!result.questions || !result.questions[0]?.question) {
      throw new Error("No valid questions found in the result");
    }

    const mcQuestion = result.questions[0];
    if (mcQuestion.questionType === "multiple-choice") {
      expect(mcQuestion.answers).toEqual(["Valid text"]);
    } else {
      throw new Error("Expected multiple-choice question");
    }
  });
});
