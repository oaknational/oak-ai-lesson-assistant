import { describe, expect, it } from "@jest/globals";

import {
  extractImageUrlsFromText,
  extractImagesFromQuestion,
} from "./extractImages";
import type { QuizV2Question } from "./types";

describe("extractImageUrlsFromText", () => {
  it("should extract single image with alt text", () => {
    const text = "Here is an image: ![diagram](https://example.com/image.jpg)";
    const result = extractImageUrlsFromText(text);

    expect(result).toEqual([
      { url: "https://example.com/image.jpg", altText: "diagram" },
    ]);
  });

  it("should extract multiple images", () => {
    const text =
      "First ![image1](https://example.com/1.jpg) and second ![image2](https://example.com/2.jpg)";
    const result = extractImageUrlsFromText(text);

    expect(result).toEqual([
      { url: "https://example.com/1.jpg", altText: "image1" },
      { url: "https://example.com/2.jpg", altText: "image2" },
    ]);
  });

  it("should handle empty alt text", () => {
    const text = "Image with no alt: ![](https://example.com/image.jpg)";
    const result = extractImageUrlsFromText(text);

    expect(result).toEqual([
      { url: "https://example.com/image.jpg", altText: "image" },
    ]);
  });

  it("should handle typical 'image' alt text", () => {
    const text = "Standard format: ![image](https://example.com/image.jpg)";
    const result = extractImageUrlsFromText(text);

    expect(result).toEqual([
      { url: "https://example.com/image.jpg", altText: "image" },
    ]);
  });

  it("should return empty array for text with no images", () => {
    const text = "This text has no images.";
    const result = extractImageUrlsFromText(text);

    expect(result).toEqual([]);
  });

  it("should filter out malformed image syntax", () => {
    const text =
      "Valid ![image](https://example.com/image.jpg) and invalid ![broken](not-a-url)";
    const result = extractImageUrlsFromText(text);

    expect(result).toEqual([
      { url: "https://example.com/image.jpg", altText: "image" },
    ]);
  });
});

describe("extractImagesFromQuestion", () => {
  it("should extract images from multiple choice question text", () => {
    const question: QuizV2Question = {
      questionType: "multiple-choice",
      question: "What is shown? ![diagram](https://example.com/diagram.jpg)",
      answers: ["Answer 1"],
      distractors: ["Distractor 1"],
      hint: null,
    };

    const result = extractImagesFromQuestion(question, 1);

    expect(result).toEqual([
      { url: "https://example.com/diagram.jpg", index: 1, altText: "diagram" },
    ]);
  });

  it("should extract images from multiple choice answers and distractors", () => {
    const question: QuizV2Question = {
      questionType: "multiple-choice",
      question: "Choose the correct option:",
      answers: ["![correct](https://example.com/correct.jpg)"],
      distractors: [
        "![wrong1](https://example.com/wrong1.jpg)",
        "![wrong2](https://example.com/wrong2.jpg)",
      ],
      hint: null,
    };

    const result = extractImagesFromQuestion(question, 2);

    expect(result).toEqual([
      { url: "https://example.com/correct.jpg", index: 1, altText: "correct" },
      { url: "https://example.com/wrong1.jpg", index: 2, altText: "wrong1" },
      { url: "https://example.com/wrong2.jpg", index: 3, altText: "wrong2" },
    ]);
  });

  it("should extract images from question text and answers combined", () => {
    const question: QuizV2Question = {
      questionType: "multiple-choice",
      question: "Based on ![chart](https://example.com/chart.jpg), choose:",
      answers: ["![option1](https://example.com/option1.jpg)"],
      distractors: ["Text distractor"],
      hint: null,
    };

    const result = extractImagesFromQuestion(question, 3);

    expect(result).toEqual([
      { url: "https://example.com/chart.jpg", index: 1, altText: "chart" },
      { url: "https://example.com/option1.jpg", index: 2, altText: "option1" },
    ]);
  });

  it("should extract images from match question pairs", () => {
    const question: QuizV2Question = {
      questionType: "match",
      question: "Match the images to descriptions:",
      pairs: [
        {
          left: "![cat](https://example.com/cat.jpg)",
          right: "Feline animal",
        },
        {
          left: "Description",
          right: "![dog](https://example.com/dog.jpg)",
        },
      ],
      hint: null,
    };

    const result = extractImagesFromQuestion(question, 4);

    expect(result).toEqual([
      { url: "https://example.com/cat.jpg", index: 1, altText: "cat" },
      { url: "https://example.com/dog.jpg", index: 2, altText: "dog" },
    ]);
  });

  it("should extract images from order question items", () => {
    const question: QuizV2Question = {
      questionType: "order",
      question: "Put these in chronological order:",
      items: [
        "![baby](https://example.com/baby.jpg)",
        "Text item",
        "![adult](https://example.com/adult.jpg)",
      ],
      hint: null,
    };

    const result = extractImagesFromQuestion(question, 5);

    expect(result).toEqual([
      { url: "https://example.com/baby.jpg", index: 1, altText: "baby" },
      { url: "https://example.com/adult.jpg", index: 2, altText: "adult" },
    ]);
  });

  it("should handle short answer questions with images in question text only", () => {
    const question: QuizV2Question = {
      questionType: "short-answer",
      question: "What is shown in ![graph](https://example.com/graph.jpg)?",
      answers: ["A graph"],
      hint: null,
    };

    const result = extractImagesFromQuestion(question, 6);

    expect(result).toEqual([
      { url: "https://example.com/graph.jpg", index: 1, altText: "graph" },
    ]);
  });

  it("should return empty array for questions with no images", () => {
    const question: QuizV2Question = {
      questionType: "short-answer",
      question: "What is 2 + 2?",
      answers: ["4"],
      hint: null,
    };

    const result = extractImagesFromQuestion(question, 7);

    expect(result).toEqual([]);
  });

  it("should maintain correct index order across different sections", () => {
    const question: QuizV2Question = {
      questionType: "multiple-choice",
      question:
        "First ![q1](https://example.com/q1.jpg) and second ![q2](https://example.com/q2.jpg)",
      answers: ["Third ![a1](https://example.com/a1.jpg)"],
      distractors: ["Fourth ![d1](https://example.com/d1.jpg)"],
      hint: null,
    };

    const result = extractImagesFromQuestion(question, 8);

    expect(result).toEqual([
      { url: "https://example.com/q1.jpg", index: 1, altText: "q1" },
      { url: "https://example.com/q2.jpg", index: 2, altText: "q2" },
      { url: "https://example.com/a1.jpg", index: 3, altText: "a1" },
      { url: "https://example.com/d1.jpg", index: 4, altText: "d1" },
    ]);
  });
});
