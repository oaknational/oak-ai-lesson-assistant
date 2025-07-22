import type { QuizV2Question } from "@oakai/aila/src/protocol/schema";

import {
  extractImageUrls,
  getAttributionsForQuestion,
  getQuestionsWithAttributions,
} from "./imageAttributionUtils";

describe("imageAttributionUtils", () => {
  describe("extractImageUrls", () => {
    it("should extract image URLs from markdown text", () => {
      const text =
        "Here is an image: ![alt text](https://example.com/image.png)";
      const urls = extractImageUrls(text);
      expect(urls).toEqual(["https://example.com/image.png"]);
    });

    it("should extract multiple image URLs", () => {
      const text =
        "![Image 1](https://example.com/1.png) and ![Image 2](https://example.com/2.jpg)";
      const urls = extractImageUrls(text);
      expect(urls).toEqual([
        "https://example.com/1.png",
        "https://example.com/2.jpg",
      ]);
    });

    it("should return empty array when no images found", () => {
      const text = "Just some text with no images";
      const urls = extractImageUrls(text);
      expect(urls).toEqual([]);
    });

    it("should handle complex alt text", () => {
      const text =
        "![Complex alt text with spaces and symbols!](https://example.com/image.png)";
      const urls = extractImageUrls(text);
      expect(urls).toEqual(["https://example.com/image.png"]);
    });
  });

  describe("getAttributionsForQuestion", () => {
    const mockAttributions = [
      {
        imageUrl: "https://example.com/image1.png",
        attribution: "© Example Corp 2024",
      },
      {
        imageUrl: "https://example.com/image2.jpg",
        attribution: "© Another Corp 2024",
      },
      {
        imageUrl: "https://example.com/image3.gif",
        attribution: "© Example Corp 2024", // Duplicate attribution
      },
    ];

    it("should return attributions for images in question text", () => {
      const question: QuizV2Question = {
        questionType: "multiple-choice",
        question: "What is shown? ![Test](https://example.com/image1.png)",
        answers: ["Answer 1"],
        distractors: ["Distractor 1"],
        hint: null,
      };

      const attributions = getAttributionsForQuestion(
        question,
        mockAttributions,
      );
      expect(attributions).toEqual(["© Example Corp 2024"]);
    });

    it("should return attributions for images in answer choices", () => {
      const question: QuizV2Question = {
        questionType: "multiple-choice",
        question: "Choose the correct image:",
        answers: ["![Correct](https://example.com/image2.jpg)"],
        distractors: ["![Wrong](https://example.com/image1.png)"],
        hint: null,
      };

      const attributions = getAttributionsForQuestion(
        question,
        mockAttributions,
      );
      expect(attributions).toHaveLength(2);
      expect(attributions).toContain("© Another Corp 2024");
      expect(attributions).toContain("© Example Corp 2024");
    });

    it("should return unique attributions when multiple images have same attribution", () => {
      const question: QuizV2Question = {
        questionType: "multiple-choice",
        question:
          "Compare: ![Image 1](https://example.com/image1.png) vs ![Image 3](https://example.com/image3.gif)",
        answers: ["Different"],
        distractors: ["Same"],
        hint: null,
      };

      const attributions = getAttributionsForQuestion(
        question,
        mockAttributions,
      );
      expect(attributions).toEqual(["© Example Corp 2024"]);
    });

    it("should return empty array when no images match attributions", () => {
      const question: QuizV2Question = {
        questionType: "multiple-choice",
        question: "What is shown? ![Test](https://different.com/image.png)",
        answers: ["Answer 1"],
        distractors: ["Distractor 1"],
        hint: null,
      };

      const attributions = getAttributionsForQuestion(
        question,
        mockAttributions,
      );
      expect(attributions).toEqual([]);
    });

    it("should return empty array when quiz attributions is empty", () => {
      const question: QuizV2Question = {
        questionType: "multiple-choice",
        question: "What is shown? ![Test](https://example.com/image1.png)",
        answers: ["Answer 1"],
        distractors: ["Distractor 1"],
        hint: null,
      };

      const attributions = getAttributionsForQuestion(question, []);
      expect(attributions).toEqual([]);
    });
  });

  describe("getQuestionsWithAttributions", () => {
    const mockAttributions = [
      {
        imageUrl: "https://example.com/image1.png",
        attribution: "© Example Corp 2024",
      },
    ];

    const mockQuestions: QuizV2Question[] = [
      {
        questionType: "multiple-choice",
        question: "Question with image ![Test](https://example.com/image1.png)",
        answers: ["Answer 1"],
        distractors: ["Distractor 1"],
        hint: null,
      },
      {
        questionType: "multiple-choice",
        question: "Question without image",
        answers: ["Answer 2"],
        distractors: ["Distractor 2"],
        hint: null,
      },
      {
        questionType: "multiple-choice",
        question:
          "Another question with image ![Test](https://example.com/image1.png)",
        answers: ["Answer 3"],
        distractors: ["Distractor 3"],
        hint: null,
      },
    ];

    it("should return only questions with attributions", () => {
      const result = getQuestionsWithAttributions(
        mockQuestions,
        mockAttributions,
      );

      expect(result).toEqual([
        {
          questionNumber: 1,
          attributions: ["© Example Corp 2024"],
        },
        {
          questionNumber: 3,
          attributions: ["© Example Corp 2024"],
        },
      ]);
    });

    it("should return empty array when no questions have attributions", () => {
      const questionsWithoutImages: QuizV2Question[] = [
        {
          questionType: "multiple-choice",
          question: "Question without image",
          answers: ["Answer 1"],
          distractors: ["Distractor 1"],
          hint: null,
        },
      ];

      const result = getQuestionsWithAttributions(
        questionsWithoutImages,
        mockAttributions,
      );
      expect(result).toEqual([]);
    });
  });
});
