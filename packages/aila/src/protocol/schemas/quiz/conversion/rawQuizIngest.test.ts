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
    });
  });

  it("should handle null quiz", () => {
    const result = convertRawQuizToV2(null);
    expect(result).toEqual({
      version: "v2",
      questions: [],
    });
  });

  it("should filter out explanatory-text questions", () => {
    const explanatoryOnlyQuiz: RawQuiz = [
      {
        question_id: 1,
        question_uid: "test-uid-1",
        question_type: "explanatory-text",
        question_stem: [{ text: "Just text", type: "text" }],
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
        question_id: 1,
        question_uid: "test-uid-1",
        question_type: "multiple-choice",
        question_stem: [
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
    // Image attributions are now embedded in the markdown content
    expect(result.questions[0]?.question).toContain(
      "![](https://example.com/image1.jpg)",
    );
  });

  it("should convert images to markdown syntax", () => {
    const quizWithImages: RawQuiz = [
      {
        question_id: 1,
        question_uid: "test-uid-1",
        question_type: "multiple-choice",
        question_stem: [
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
});
