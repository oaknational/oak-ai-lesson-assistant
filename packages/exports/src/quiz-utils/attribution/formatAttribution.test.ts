import { describe, expect, it } from "@jest/globals";

import {
  formatAttributionText,
  formatQuizAttributions,
  mapQuestionImages,
} from "./formatAttribution";
import type {
  ImageAttribution,
  ImageWithAttribution,
  QuizV2Question,
} from "./types";

describe("mapQuestionImages", () => {
  const mockAttributions: ImageAttribution[] = [
    {
      imageUrl: "https://example.com/image1.jpg",
      attribution: "Pixabay",
    },
    {
      imageUrl: "https://example.com/image2.jpg",
      attribution: "Shutterstock / Jane Doe",
    },
    {
      imageUrl: "https://example.com/image3.jpg",
      attribution: "Oak National Academy",
    },
  ];

  it("should map questions with single images to attributions", () => {
    const questions: QuizV2Question[] = [
      {
        questionType: "multiple-choice",
        question: "What is this? ![image](https://example.com/image1.jpg)",
        answers: ["Answer"],
        distractors: ["Distractor"],
        hint: null,
      },
    ];

    const result = mapQuestionImages(questions, mockAttributions);

    expect(result).toEqual([
      {
        questionNumber: 1,
        imageIndex: 1,
        imageUrl: "https://example.com/image1.jpg",
        attribution: "Pixabay",
        altText: "image",
      },
    ]);
  });

  it("should map multiple images within a single question", () => {
    const questions: QuizV2Question[] = [
      {
        questionType: "multiple-choice",
        question:
          "Compare ![first](https://example.com/image1.jpg) and ![second](https://example.com/image2.jpg)",
        answers: ["Same"],
        distractors: ["Different"],
        hint: null,
      },
    ];

    const result = mapQuestionImages(questions, mockAttributions);

    expect(result).toEqual([
      {
        questionNumber: 1,
        imageIndex: 1,
        imageUrl: "https://example.com/image1.jpg",
        attribution: "Pixabay",
        altText: "first",
      },
      {
        questionNumber: 1,
        imageIndex: 2,
        imageUrl: "https://example.com/image2.jpg",
        attribution: "Shutterstock / Jane Doe",
        altText: "second",
      },
    ]);
  });

  it("should map images across multiple questions", () => {
    const questions: QuizV2Question[] = [
      {
        questionType: "short-answer",
        question: "What is ![first](https://example.com/image1.jpg)?",
        answers: ["Answer 1"],
        hint: null,
      },
      {
        questionType: "multiple-choice",
        question: "Choose the correct image:",
        answers: ["![correct](https://example.com/image2.jpg)"],
        distractors: ["Wrong answer"],
        hint: null,
      },
    ];

    const result = mapQuestionImages(questions, mockAttributions);

    expect(result).toEqual([
      {
        questionNumber: 1,
        imageIndex: 1,
        imageUrl: "https://example.com/image1.jpg",
        attribution: "Pixabay",
        altText: "first",
      },
      {
        questionNumber: 2,
        imageIndex: 1,
        imageUrl: "https://example.com/image2.jpg",
        attribution: "Shutterstock / Jane Doe",
        altText: "correct",
      },
    ]);
  });

  it("should skip images without attributions", () => {
    const questions: QuizV2Question[] = [
      {
        questionType: "multiple-choice",
        question:
          "What is ![known](https://example.com/image1.jpg) vs ![unknown](https://example.com/unknown.jpg)?",
        answers: ["Answer"],
        distractors: ["Distractor"],
        hint: null,
      },
    ];

    const result = mapQuestionImages(questions, mockAttributions);

    expect(result).toEqual([
      {
        questionNumber: 1,
        imageIndex: 1,
        imageUrl: "https://example.com/image1.jpg",
        attribution: "Pixabay",
        altText: "known",
      },
    ]);
  });

  it("should return empty array for questions with no images", () => {
    const questions: QuizV2Question[] = [
      {
        questionType: "short-answer",
        question: "What is 2 + 2?",
        answers: ["4"],
        hint: null,
      },
    ];

    const result = mapQuestionImages(questions, mockAttributions);

    expect(result).toEqual([]);
  });
});

describe("formatAttributionText", () => {
  it("should return empty string for no images", () => {
    const result = formatAttributionText([]);

    expect(result).toEqual({
      plainText: "",
      segments: [],
    });
  });

  it("should format single image correctly", () => {
    const images: ImageWithAttribution[] = [
      {
        questionNumber: 1,
        imageIndex: 1,
        imageUrl: "https://example.com/image1.jpg",
        attribution: "Pixabay",
        altText: "diagram",
      },
    ];

    const result = formatAttributionText(images);

    expect(result.plainText).toBe("Q1 Image 1 Pixabay");
    expect(result.segments).toEqual([
      { text: "Q1 Image 1", bold: true },
      { text: " Pixabay", bold: false },
    ]);
  });

  it("should format multiple images in same question", () => {
    const images: ImageWithAttribution[] = [
      {
        questionNumber: 1,
        imageIndex: 1,
        imageUrl: "https://example.com/image1.jpg",
        attribution: "Pixabay",
        altText: "first",
      },
      {
        questionNumber: 1,
        imageIndex: 2,
        imageUrl: "https://example.com/image2.jpg",
        attribution: "Shutterstock",
        altText: "second",
      },
    ];

    const result = formatAttributionText(images);

    expect(result.plainText).toBe("Q1 Image 1 Pixabay; Image 2 Shutterstock");
    expect(result.segments).toEqual([
      { text: "Q1 Image 1", bold: true },
      { text: " Pixabay", bold: false },
      { text: "; ", bold: false },
      { text: "Image 2", bold: true },
      { text: " Shutterstock", bold: false },
    ]);
  });

  it("should format images across multiple questions", () => {
    const images: ImageWithAttribution[] = [
      {
        questionNumber: 1,
        imageIndex: 1,
        imageUrl: "https://example.com/image1.jpg",
        attribution: "Pixabay",
        altText: "first",
      },
      {
        questionNumber: 2,
        imageIndex: 1,
        imageUrl: "https://example.com/image2.jpg",
        attribution: "Shutterstock",
        altText: "second",
      },
    ];

    const result = formatAttributionText(images);

    expect(result.plainText).toBe("Q1 Image 1 Pixabay Q2 Image 1 Shutterstock");
    expect(result.segments).toEqual([
      { text: "Q1 Image 1", bold: true },
      { text: " Pixabay", bold: false },
      { text: " ", bold: false },
      { text: "Q2 Image 1", bold: true },
      { text: " Shutterstock", bold: false },
    ]);
  });

  it("should handle complex scenario with multiple questions and multiple images", () => {
    const images: ImageWithAttribution[] = [
      {
        questionNumber: 1,
        imageIndex: 1,
        imageUrl: "https://example.com/image1.jpg",
        attribution: "Pixabay",
        altText: "diagram",
      },
      {
        questionNumber: 2,
        imageIndex: 1,
        imageUrl: "https://example.com/image2.jpg",
        attribution: "Shutterstock",
        altText: "graph",
      },
      {
        questionNumber: 2,
        imageIndex: 2,
        imageUrl: "https://example.com/image3.jpg",
        attribution: "Oak National Academy",
        altText: "chart",
      },
      {
        questionNumber: 3,
        imageIndex: 1,
        imageUrl: "https://example.com/image4.jpg",
        attribution: "CIEC",
        altText: "photo",
      },
    ];

    const result = formatAttributionText(images);

    expect(result.plainText).toBe(
      "Q1 Image 1 Pixabay Q2 Image 1 Shutterstock; Image 2 Oak National Academy Q3 Image 1 CIEC",
    );
    expect(result.segments).toEqual([
      { text: "Q1 Image 1", bold: true },
      { text: " Pixabay", bold: false },
      { text: " ", bold: false },
      { text: "Q2 Image 1", bold: true },
      { text: " Shutterstock", bold: false },
      { text: "; ", bold: false },
      { text: "Image 2", bold: true },
      { text: " Oak National Academy", bold: false },
      { text: " ", bold: false },
      { text: "Q3 Image 1", bold: true },
      { text: " CIEC", bold: false },
    ]);
  });

  it("should sort questions by number", () => {
    const images: ImageWithAttribution[] = [
      {
        questionNumber: 3,
        imageIndex: 1,
        imageUrl: "https://example.com/image3.jpg",
        attribution: "Third",
        altText: "image",
      },
      {
        questionNumber: 1,
        imageIndex: 1,
        imageUrl: "https://example.com/image1.jpg",
        attribution: "First",
        altText: "image",
      },
      {
        questionNumber: 2,
        imageIndex: 1,
        imageUrl: "https://example.com/image2.jpg",
        attribution: "Second",
        altText: "image",
      },
    ];

    const result = formatAttributionText(images);

    expect(result.plainText).toBe(
      "Q1 Image 1 First Q2 Image 1 Second Q3 Image 1 Third",
    );
  });

  it("should sort images within question by index", () => {
    const images: ImageWithAttribution[] = [
      {
        questionNumber: 1,
        imageIndex: 3,
        imageUrl: "https://example.com/image3.jpg",
        attribution: "Third",
        altText: "image",
      },
      {
        questionNumber: 1,
        imageIndex: 1,
        imageUrl: "https://example.com/image1.jpg",
        attribution: "First",
        altText: "image",
      },
      {
        questionNumber: 1,
        imageIndex: 2,
        imageUrl: "https://example.com/image2.jpg",
        attribution: "Second",
        altText: "image",
      },
    ];

    const result = formatAttributionText(images);

    expect(result.plainText).toBe(
      "Q1 Image 1 First; Image 2 Second; Image 3 Third",
    );
  });
});

describe("formatQuizAttributions", () => {
  const mockAttributions: ImageAttribution[] = [
    {
      imageUrl: "https://example.com/pixabay.jpg",
      attribution: "Pixabay",
    },
    {
      imageUrl: "https://example.com/shutterstock.jpg",
      attribution: "Shutterstock / Jane Doe",
    },
  ];

  it("should integrate image extraction and formatting", () => {
    const questions: QuizV2Question[] = [
      {
        questionType: "multiple-choice",
        question: "What is ![diagram](https://example.com/pixabay.jpg)?",
        answers: ["![answer](https://example.com/shutterstock.jpg)"],
        distractors: ["Text answer"],
        hint: null,
      },
    ];

    const result = formatQuizAttributions(questions, mockAttributions);

    expect(result.plainText).toBe(
      "Q1 Image 1 Pixabay; Image 2 Shutterstock / Jane Doe",
    );
    expect(result.segments).toEqual([
      { text: "Q1 Image 1", bold: true },
      { text: " Pixabay", bold: false },
      { text: "; ", bold: false },
      { text: "Image 2", bold: true },
      { text: " Shutterstock / Jane Doe", bold: false },
    ]);
  });

  it("should return empty result for no images", () => {
    const questions: QuizV2Question[] = [
      {
        questionType: "short-answer",
        question: "What is 2 + 2?",
        answers: ["4"],
        hint: null,
      },
    ];

    const result = formatQuizAttributions(questions, mockAttributions);

    expect(result).toEqual({
      plainText: "",
      segments: [],
    });
  });

  it("should handle questions with images but no attributions", () => {
    const questions: QuizV2Question[] = [
      {
        questionType: "multiple-choice",
        question: "What is ![unknown](https://example.com/unknown.jpg)?",
        answers: ["Answer"],
        distractors: ["Distractor"],
        hint: null,
      },
    ];

    const result = formatQuizAttributions(questions, mockAttributions);

    expect(result).toEqual({
      plainText: "",
      segments: [],
    });
  });
});
