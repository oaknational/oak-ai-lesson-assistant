import type { QuizV2Question } from "@oakai/aila/src/protocol/schema";

import {
  extractImageUrls,
  getAttributionsForQuestion,
  getFormattedAttributions,
  getGroupedAttributions,
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
        imageUrl: "https://cdn.pixabay.com/photo/2023/01/nature-landscape.jpg",
        attribution: "Pixabay",
      },
      {
        imageUrl: "https://ciec.org.uk/images/classroom-activity.jpg",
        attribution: "CIEC",
      },
      {
        imageUrl:
          "https://cdn.pixabay.com/photo/2023/02/science-experiment.jpg",
        attribution: "Pixabay", // Duplicate attribution
      },
      {
        imageUrl: "https://shutterstock.com/image-id-123456/lab-equipment.jpg",
        attribution: "Shutterstock / Jane Doe",
      },
    ];

    it("should return attributions for images in question text", () => {
      const question: QuizV2Question = {
        questionType: "multiple-choice",
        question:
          "What is shown? ![Test](https://cdn.pixabay.com/photo/2023/01/nature-landscape.jpg)",
        answers: ["Answer 1"],
        distractors: ["Distractor 1"],
        hint: null,
      };

      const attributions = getAttributionsForQuestion(
        question,
        mockAttributions,
      );
      expect(attributions).toEqual(["Pixabay"]);
    });

    it("should return attributions for images in answer choices", () => {
      const question: QuizV2Question = {
        questionType: "multiple-choice",
        question: "Choose the correct image:",
        answers: [
          "![Correct](https://ciec.org.uk/images/classroom-activity.jpg)",
        ],
        distractors: [
          "![Wrong](https://cdn.pixabay.com/photo/2023/01/nature-landscape.jpg)",
        ],
        hint: null,
      };

      const attributions = getAttributionsForQuestion(
        question,
        mockAttributions,
      );
      expect(attributions).toHaveLength(2);
      expect(attributions).toContain("CIEC");
      expect(attributions).toContain("Pixabay");
    });

    it("should return unique attributions when multiple images have same attribution", () => {
      const question: QuizV2Question = {
        questionType: "multiple-choice",
        question:
          "Compare: ![Image 1](https://cdn.pixabay.com/photo/2023/01/nature-landscape.jpg) vs ![Image 3](https://cdn.pixabay.com/photo/2023/02/science-experiment.jpg)",
        answers: ["Different"],
        distractors: ["Same"],
        hint: null,
      };

      const attributions = getAttributionsForQuestion(
        question,
        mockAttributions,
      );
      expect(attributions).toEqual(["Pixabay"]);
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
        question:
          "What is shown? ![Test](https://cdn.pixabay.com/photo/2023/01/nature-landscape.jpg)",
        answers: ["Answer 1"],
        distractors: ["Distractor 1"],
        hint: null,
      };

      const attributions = getAttributionsForQuestion(question, []);
      expect(attributions).toEqual([]);
    });
  });

  describe("getGroupedAttributions", () => {
    const mockAttributions = [
      {
        imageUrl: "https://cdn.pixabay.com/photo/2023/01/classroom.jpg",
        attribution: "Pixabay",
      },
      {
        imageUrl: "https://ciec.org.uk/images/science-lesson.jpg",
        attribution: "CIEC",
      },
      {
        imageUrl: "https://cdn.pixabay.com/photo/2023/02/students.jpg",
        attribution: "Pixabay",
      },
      {
        imageUrl: "https://oaknationalacademy.com/images/lesson-materials.png",
        attribution: "Oak National Academy",
      },
      {
        imageUrl: "https://cdn.pixabay.com/photo/2023/03/experiment.jpg",
        attribution: "Pixabay",
      },
      {
        imageUrl: "https://shutterstock.com/image-12345/chemistry-lab.png",
        attribution: "Shutterstock / John Smith",
      },
      {
        imageUrl: "https://uyseg.org/resources/education-photo.jpg",
        attribution: "UYSEG",
      },
      {
        imageUrl: "https://images.pexels.com/photos/2023/school-activity.png",
        attribution: "Pexels",
      },
    ];

    it("should group questions by attribution", () => {
      const mockQuestions: QuizV2Question[] = [
        {
          questionType: "multiple-choice",
          question:
            "Q1 with image ![Test](https://cdn.pixabay.com/photo/2023/01/classroom.jpg)",
          answers: ["Answer 1"],
          distractors: ["Distractor 1"],
          hint: null,
        },
        {
          questionType: "multiple-choice",
          question:
            "Q2 with image ![Test](https://ciec.org.uk/images/science-lesson.jpg)",
          answers: ["Answer 2"],
          distractors: ["Distractor 2"],
          hint: null,
        },
        {
          questionType: "multiple-choice",
          question:
            "Q3 with image ![Test](https://cdn.pixabay.com/photo/2023/02/students.jpg)",
          answers: ["Answer 3"],
          distractors: ["Distractor 3"],
          hint: null,
        },
        {
          questionType: "multiple-choice",
          question:
            "Q4 with image ![Test](https://cdn.pixabay.com/photo/2023/03/experiment.jpg)",
          answers: ["Answer 4"],
          distractors: ["Distractor 4"],
          hint: null,
        },
      ];

      const result = getGroupedAttributions(mockQuestions, mockAttributions);

      expect(result).toEqual({
        Pixabay: [1, 3, 4],
        CIEC: [2],
      });
    });

    it("should handle questions with multiple attributions as separate tallies", () => {
      const mockQuestions: QuizV2Question[] = [
        {
          questionType: "multiple-choice",
          question:
            "Q1 with two images ![Test](https://cdn.pixabay.com/photo/2023/01/classroom.jpg) and ![Test2](https://oaknationalacademy.com/images/lesson-materials.png)",
          answers: ["Answer 1"],
          distractors: ["Distractor 1"],
          hint: null,
        },
        {
          questionType: "multiple-choice",
          question:
            "Q2 with image ![Test](https://cdn.pixabay.com/photo/2023/03/experiment.jpg)",
          answers: ["Answer 2"],
          distractors: ["Distractor 2"],
          hint: null,
        },
        {
          questionType: "multiple-choice",
          question:
            "Q3 with partner image ![Test](https://uyseg.org/resources/education-photo.jpg)",
          answers: ["Answer 3"],
          distractors: ["Distractor 3"],
          hint: null,
        },
      ];

      const result = getGroupedAttributions(mockQuestions, mockAttributions);

      expect(result).toEqual({
        Pixabay: [1, 2],
        "Oak National Academy": [1],
        UYSEG: [3],
      });
    });

    it("should return empty object when no questions have images", () => {
      const questionsWithoutImages: QuizV2Question[] = [
        {
          questionType: "multiple-choice",
          question: "Question without image",
          answers: ["Answer 1"],
          distractors: ["Distractor 1"],
          hint: null,
        },
      ];

      const result = getGroupedAttributions(
        questionsWithoutImages,
        mockAttributions,
      );
      expect(result).toEqual({});
    });

    it("should skip questions with images that have no attribution", () => {
      const mockQuestions: QuizV2Question[] = [
        {
          questionType: "multiple-choice",
          question:
            "Q1 with Pixabay image ![Test](https://cdn.pixabay.com/photo/2023/01/classroom.jpg)",
          answers: ["Answer 1"],
          distractors: ["Distractor 1"],
          hint: null,
        },
        {
          questionType: "multiple-choice",
          question:
            "Q2 with unattributed image ![Test](https://example.com/unknown.jpg)",
          answers: ["Answer 2"],
          distractors: ["Distractor 2"],
          hint: null,
        },
        {
          questionType: "multiple-choice",
          question:
            "Q3 with Shutterstock image ![Test](https://shutterstock.com/image-12345/chemistry-lab.png)",
          answers: ["Answer 3"],
          distractors: ["Distractor 3"],
          hint: null,
        },
        {
          questionType: "multiple-choice",
          question:
            "Q4 with Pexels image ![Test](https://images.pexels.com/photos/2023/school-activity.png)",
          answers: ["Answer 4"],
          distractors: ["Distractor 4"],
          hint: null,
        },
      ];

      const result = getGroupedAttributions(mockQuestions, mockAttributions);

      expect(result).toEqual({
        Pixabay: [1],
        "Shutterstock / John Smith": [3],
        Pexels: [4],
      });
    });

    it("should return empty object when attributions array is empty", () => {
      const mockQuestions: QuizV2Question[] = [
        {
          questionType: "multiple-choice",
          question:
            "Q1 with image ![Test](https://cdn.pixabay.com/photo/2023/01/classroom.jpg)",
          answers: ["Answer 1"],
          distractors: ["Distractor 1"],
          hint: null,
        },
      ];

      const result = getGroupedAttributions(mockQuestions, []);
      expect(result).toEqual({});
    });
  });

  describe("getFormattedAttributions", () => {
    const mockAttributions = [
      {
        imageUrl: "https://cdn.pixabay.com/photo/2023/01/classroom.jpg",
        attribution: "Pixabay",
      },
      {
        imageUrl: "https://ciec.org.uk/images/science-lesson.jpg",
        attribution: "CIEC",
      },
      {
        imageUrl: "https://cdn.pixabay.com/photo/2023/02/students.jpg",
        attribution: "Pixabay",
      },
      {
        imageUrl: "https://oaknationalacademy.com/images/lesson-materials.png",
        attribution: "Oak National Academy",
      },
    ];

    it("should return formatted attributions with question ranges", () => {
      const mockQuestions: QuizV2Question[] = [
        {
          questionType: "multiple-choice",
          question:
            "Q1 with image ![Test](https://cdn.pixabay.com/photo/2023/01/classroom.jpg)",
          answers: ["Answer 1"],
          distractors: ["Distractor 1"],
          hint: null,
        },
        {
          questionType: "multiple-choice",
          question:
            "Q2 with image ![Test](https://ciec.org.uk/images/science-lesson.jpg)",
          answers: ["Answer 2"],
          distractors: ["Distractor 2"],
          hint: null,
        },
        {
          questionType: "multiple-choice",
          question:
            "Q3 with image ![Test](https://cdn.pixabay.com/photo/2023/02/students.jpg)",
          answers: ["Answer 3"],
          distractors: ["Distractor 3"],
          hint: null,
        },
        {
          questionType: "multiple-choice",
          question:
            "Q4 with image ![Test](https://oaknationalacademy.com/images/lesson-materials.png)",
          answers: ["Answer 4"],
          distractors: ["Distractor 4"],
          hint: null,
        },
      ];

      const result = getFormattedAttributions(mockQuestions, mockAttributions);

      expect(result).toEqual([
        { attribution: "Pixabay", questionRange: "Q1, Q3" },
        { attribution: "CIEC", questionRange: "Q2" },
        { attribution: "Oak National Academy", questionRange: "Q4" },
      ]);
    });

    it("should return empty array when no attributions exist", () => {
      const mockQuestions: QuizV2Question[] = [
        {
          questionType: "multiple-choice",
          question: "Question without images",
          answers: ["Answer 1"],
          distractors: ["Distractor 1"],
          hint: null,
        },
      ];

      const result = getFormattedAttributions(mockQuestions, mockAttributions);
      expect(result).toEqual([]);
    });
  });
});
