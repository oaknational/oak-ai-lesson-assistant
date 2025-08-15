import { describe, expect, it } from "@jest/globals";

import { rawQuizFixture } from "../fixtures/rawQuizFixture";
import type { RawQuiz } from "../rawQuiz";
import { convertRawQuizToV2 } from "./rawQuizIngest";

describe("convertRawQuizToV2", () => {
  it("should convert raw quiz to V2 format", () => {
    const result = convertRawQuizToV2(rawQuizFixture);
    expect(result).toMatchSnapshot();
  });

  it("should handle empty quiz", () => {
    const result = convertRawQuizToV2([]);
    expect(result).toEqual({
      version: "v2",
      questions: [],
      imageAttributions: [],
    });
  });

  it("should handle null quiz", () => {
    const result = convertRawQuizToV2(null);
    expect(result).toEqual({
      version: "v2",
      questions: [],
      imageAttributions: [],
    });
  });

  it("should filter out explanatory-text questions", () => {
    const explanatoryOnlyQuiz: RawQuiz = [
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
    const result = convertRawQuizToV2(explanatoryOnlyQuiz);
    expect(result.questions).toHaveLength(0);
  });

  it("should extract image attributions correctly", () => {
    const quizWithImages: RawQuiz = [
      {
        questionId: 1,
        questionUid: "test-uid-1",
        questionType: "multiple-choice",
        questionStem: [
          {
            image_object: {
              secure_url: "https://example.com/image1.jpg",
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
    const result = convertRawQuizToV2(quizWithImages);
    expect(result.questions[0]?.question).toContain(
      "![](https://example.com/image1.jpg)",
    );
    expect(result.imageAttributions).toEqual([
      {
        imageUrl: "https://example.com/image1.jpg",
        attribution: "Photo by Photographer",
      },
    ]);
  });

  it("should convert images to markdown syntax", () => {
    const quizWithImages: RawQuiz = [
      {
        questionId: 1,
        questionUid: "test-uid-1",
        questionType: "multiple-choice",
        questionStem: [
          { text: "Look at", type: "text" },
          {
            image_object: {
              secure_url: "https://example.com/image.jpg",
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
    const result = convertRawQuizToV2(quizWithImages);
    expect(result.questions[0]?.question).toBe(
      "Look at ![](https://example.com/image.jpg) What is it?",
    );
  });

  it("should extract alt text from images when available", () => {
    const quizWithAltText: RawQuiz = [
      {
        questionId: 1,
        questionUid: "test-uid-1",
        questionType: "multiple-choice",
        questionStem: [
          {
            image_object: {
              secure_url: "https://example.com/dog.jpg",
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
    const result = convertRawQuizToV2(quizWithAltText);
    expect(result.questions[0]?.question).toBe(
      "![A golden retriever sitting in a park](https://example.com/dog.jpg)",
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
    ] as RawQuiz;
    expect(() => convertRawQuizToV2(unknownTypeQuiz)).toThrow(
      "Unknown question type: unknown-type",
    );
  });
});
