import { describe, expect, it } from "@jest/globals";

import { rawQuizFixture } from "../fixtures/rawQuizFixture";
import type { QuizV2QuestionMultipleChoice } from "../quizV2";
import type { HasuraQuiz } from "../rawQuiz";
import { convertHasuraQuizToV3 } from "./rawQuizIngest";

describe("convertHasuraQuizToV3", () => {
  it("should convert Hasura quiz to V3 format", () => {
    const result = convertHasuraQuizToV3(rawQuizFixture);
    expect(result).toMatchSnapshot();
  });

  it("should handle empty quiz", () => {
    const result = convertHasuraQuizToV3([]);
    expect(result).toEqual({
      version: "v3",
      questions: [],
      imageMetadata: [],
    });
  });

  it("should handle null quiz", () => {
    const result = convertHasuraQuizToV3(null);
    expect(result).toEqual({
      version: "v3",
      questions: [],
      imageMetadata: [],
    });
  });

  it("should filter out explanatory-text questions", () => {
    const explanatoryOnlyQuiz: HasuraQuiz = [
      {
        questionId: 1,
        questionUid: "test-uid-1",
        questionType: "explanatory-text",
        questionStem: [{ text: "Just text", type: "text" }],
        answers: { "explanatory-text": null },
        feedback: "",
        hint: "",
        active: true,
      },
    ];
    const result = convertHasuraQuizToV3(explanatoryOnlyQuiz);
    expect(result.questions).toHaveLength(0);
  });

  it("should extract image attributions correctly", () => {
    const quizWithImages: HasuraQuiz = [
      {
        questionId: 1,
        questionUid: "test-uid-1",
        questionType: "multiple-choice",
        questionStem: [
          {
            image_object: {
              secure_url: "https://example.com/image/upload/image1.jpg",
              width: 800,
              height: 600,
              metadata: {
                attribution: "Photo by Photographer",
              },
            },
            type: "image",
          },
        ],
        answers: {
          "multiple-choice": [
            {
              answer: [{ text: "A", type: "text" }],
              answer_is_correct: true,
            },
          ],
        },
        feedback: "",
        hint: "",
        active: true,
      },
    ];
    const result = convertHasuraQuizToV3(quizWithImages);
    expect(result.questions[0]?.question).toContain(
      "![](https://example.com/image/upload/image1.jpg)",
    );
    expect(result.imageMetadata).toEqual([
      {
        imageUrl: "https://example.com/image/upload/image1.jpg",
        attribution: "Photo by Photographer",
        width: 800,
        height: 600,
      },
    ]);
  });

  it("should convert images to markdown syntax", () => {
    const quizWithImages: HasuraQuiz = [
      {
        questionId: 1,
        questionUid: "test-uid-1",
        questionType: "multiple-choice",
        questionStem: [
          { text: "Look at", type: "text" },
          {
            image_object: {
              secure_url: "https://example.com/image/upload/image.jpg",
              width: 800,
              height: 600,
              metadata: {},
            },
            type: "image",
          },
          { text: "What is it?", type: "text" },
        ],
        answers: {
          "multiple-choice": [
            {
              answer: [{ text: "A", type: "text" }],
              answer_is_correct: true,
            },
          ],
        },
        feedback: "",
        hint: "",
        active: true,
      },
    ];
    const result = convertHasuraQuizToV3(quizWithImages);
    expect(result.questions[0]?.question).toBe(
      "Look at ![](https://example.com/image/upload/image.jpg) What is it?",
    );
  });

  it("should extract alt text from images when available", () => {
    const quizWithAltText: HasuraQuiz = [
      {
        questionId: 1,
        questionUid: "test-uid-1",
        questionType: "multiple-choice",
        questionStem: [
          {
            image_object: {
              secure_url: "https://example.com/image/upload/dog.jpg",
              width: 800,
              height: 600,
              metadata: {},
              context: {
                custom: {
                  alt: "A golden retriever sitting in a park",
                },
              },
            },
            type: "image",
          },
        ],
        answers: {
          "multiple-choice": [
            {
              answer: [{ text: "Dog", type: "text" }],
              answer_is_correct: true,
            },
          ],
        },
        feedback: "",
        hint: "",
        active: true,
      },
    ];
    const result = convertHasuraQuizToV3(quizWithAltText);
    expect(result.questions[0]?.question).toBe(
      "![A golden retriever sitting in a park](https://example.com/image/upload/dog.jpg)",
    );
  });

  it("should throw error for unknown question type", () => {
    const unknownTypeQuiz = [
      {
        questionId: 1,
        questionUid: "test-uid-1",
        questionType: "unknown-type" as unknown as "multiple-choice",
        questionStem: [{ text: "Question", type: "text" }],
        answers: {},
        feedback: "",
        hint: "",
        active: true,
      },
    ] as HasuraQuiz;
    expect(() => convertHasuraQuizToV3(unknownTypeQuiz)).toThrow(
      "Unknown question type: unknown-type",
    );
  });

  it("should filter out single answer letters when images are present", () => {
    const quizWithLetterAndImage: HasuraQuiz = [
      {
        questionId: 1,
        questionUid: "test-uid-1",
        questionType: "multiple-choice",
        questionStem: [{ text: "Question", type: "text" }],
        answers: {
          "multiple-choice": [
            {
              answer: [
                { text: "A", type: "text" },
                {
                  image_object: {
                    secure_url: "https://example.com/image/upload/answer1.jpg",
                    height: 600,
                    width: 800,
                    metadata: {},
                  },
                  type: "image",
                },
              ],
              answer_is_correct: true,
            },
            {
              answer: [
                { text: "B.", type: "text" },
                {
                  image_object: {
                    secure_url: "https://example.com/image/upload/answer2.jpg",
                    height: 600,
                    width: 800,
                    metadata: {},
                  },
                  type: "image",
                },
              ],
              answer_is_correct: false,
            },
          ],
        },
        feedback: "",
        hint: "",
        active: true,
      },
    ];
    const result = convertHasuraQuizToV3(quizWithLetterAndImage);
    const question = result.questions[0] as QuizV2QuestionMultipleChoice;

    // Single letters should be filtered out, leaving only images
    expect(question.answers[0]).toBe(
      "![](https://example.com/image/upload/answer1.jpg)",
    );
    expect(question.distractors[0]).toBe(
      "![](https://example.com/image/upload/answer2.jpg)",
    );
  });

  it("should keep single answer letter when it's the only content", () => {
    const quizWithOnlyLetter: HasuraQuiz = [
      {
        questionId: 1,
        questionUid: "test-uid-1",
        questionType: "multiple-choice",
        questionStem: [{ text: "Question", type: "text" }],
        answers: {
          "multiple-choice": [
            {
              answer: [{ text: "A", type: "text" }],
              answer_is_correct: true,
            },
          ],
        },
        feedback: "",
        hint: "",
        active: true,
      },
    ];
    const result = convertHasuraQuizToV3(quizWithOnlyLetter);
    const question = result.questions[0] as QuizV2QuestionMultipleChoice;

    // Single letter should be kept when it's the only content
    expect(question.answers[0]).toBe("A");
  });

  it("should keep meaningful text alongside images", () => {
    const quizWithMeaningfulText: HasuraQuiz = [
      {
        questionId: 1,
        questionUid: "test-uid-1",
        questionType: "multiple-choice",
        questionStem: [{ text: "Question", type: "text" }],
        answers: {
          "multiple-choice": [
            {
              answer: [
                { text: "Option text", type: "text" },
                {
                  image_object: {
                    secure_url: "https://example.com/image/upload/image.jpg",
                    height: 600,
                    width: 800,
                    metadata: {},
                  },
                  type: "image",
                },
              ],
              answer_is_correct: true,
            },
          ],
        },
        feedback: "",
        hint: "",
        active: true,
      },
    ];
    const result = convertHasuraQuizToV3(quizWithMeaningfulText);
    const question = result.questions[0] as QuizV2QuestionMultipleChoice;

    // Meaningful text should be kept alongside images
    expect(question.answers[0]).toBe(
      "Option text ![](https://example.com/image/upload/image.jpg)",
    );
  });

  it("should keep numbers alongside images (not filtering numbers)", () => {
    const quizWithNumberAndImage: HasuraQuiz = [
      {
        questionId: 1,
        questionUid: "test-uid-1",
        questionType: "multiple-choice",
        questionStem: [{ text: "Question", type: "text" }],
        answers: {
          "multiple-choice": [
            {
              answer: [
                { text: "1", type: "text" },
                {
                  image_object: {
                    secure_url: "https://example.com/image/upload/image.jpg",
                    height: 600,
                    width: 800,
                    metadata: {},
                  },
                  type: "image",
                },
              ],
              answer_is_correct: true,
            },
          ],
        },
        feedback: "",
        hint: "",
        active: true,
      },
    ];
    const result = convertHasuraQuizToV3(quizWithNumberAndImage);
    const question = result.questions[0] as QuizV2QuestionMultipleChoice;

    // Numbers should be kept (not filtered as single answer labels)
    expect(question.answers[0]).toBe(
      "1 ![](https://example.com/image/upload/image.jpg)",
    );
  });

  it("should handle various letter patterns (uppercase, lowercase, with periods)", () => {
    const quizWithVariousLetters: HasuraQuiz = [
      {
        questionId: 1,
        questionUid: "test-uid-1",
        questionType: "multiple-choice",
        questionStem: [{ text: "Question", type: "text" }],
        answers: {
          "multiple-choice": [
            {
              answer: [
                { text: "a", type: "text" },
                {
                  image_object: {
                    secure_url: "https://example.com/image/upload/image1.jpg",
                    height: 600,
                    width: 800,
                    metadata: {},
                  },
                  type: "image",
                },
              ],
              answer_is_correct: true,
            },
            {
              answer: [
                { text: "D.", type: "text" },
                {
                  image_object: {
                    secure_url: "https://example.com/image/upload/image2.jpg",
                    height: 600,
                    width: 800,
                    metadata: {},
                  },
                  type: "image",
                },
              ],
              answer_is_correct: false,
            },
          ],
        },
        feedback: "",
        hint: "",
        active: true,
      },
    ];
    const result = convertHasuraQuizToV3(quizWithVariousLetters);
    const question = result.questions[0] as QuizV2QuestionMultipleChoice;

    // All letter patterns should be filtered out
    expect(question.answers[0]).toBe(
      "![](https://example.com/image/upload/image1.jpg)",
    );
    expect(question.distractors[0]).toBe(
      "![](https://example.com/image/upload/image2.jpg)",
    );
  });
});
