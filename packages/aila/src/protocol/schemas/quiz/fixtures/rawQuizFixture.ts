import type { RawQuiz } from "../rawQuiz";

export const rawQuizFixture: RawQuiz = [
  {
    question_id: 1,
    question_uid: "test-uid-1",
    question_type: "multiple-choice",
    question_stem: [
      {
        text: "What is the capital of France?",
        type: "text",
      },
    ],
    answers: {
      "multiple-choice": [
        {
          answer: [{ text: "Paris", type: "text" }],
          answer_is_correct: true,
        },
        {
          answer: [{ text: "London", type: "text" }],
          answer_is_correct: false,
        },
        {
          answer: [{ text: "Berlin", type: "text" }],
          answer_is_correct: false,
        },
      ],
    },
    feedback: "Paris is the capital of France",
    hint: "Think about the Eiffel Tower",
    active: true,
  },
  {
    question_id: 2,
    question_uid: "test-uid-2",
    question_type: "short-answer",
    question_stem: [
      {
        text: "Name a primary color",
        type: "text",
      },
    ],
    answers: {
      "short-answer": [
        { answer: [{ text: "red", type: "text" }], answer_is_default: true },
        { answer: [{ text: "blue", type: "text" }], answer_is_default: false },
        {
          answer: [{ text: "yellow", type: "text" }],
          answer_is_default: false,
        },
      ],
    },
    feedback: "Primary colors are red, blue, and yellow",
    hint: "These colors cannot be created by mixing other colors",
    active: true,
  },
  {
    question_id: 3,
    question_uid: "test-uid-3",
    question_type: "multiple-choice",
    question_stem: [
      {
        text: "Which animal is shown in the image?",
        type: "text",
      },
      {
        image_object: {
          secure_url: "https://example.com/dog.jpg",
          url: "https://example.com/dog.jpg",
          metadata: {
            attribution: "Photo by John Doe on Unsplash",
            usageRestriction: "Free to use",
          },
          context: {
            custom: {
              alt: "A friendly golden retriever sitting in a park",
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
        {
          answer: [
            {
              text: "Cat",
              type: "text",
            },
            {
              image_object: {
                secure_url: "https://example.com/cat.jpg",
                metadata: {
                  attribution: "Image © Example Inc",
                },
              },
              type: "image",
            },
          ],
          answer_is_correct: false,
        },
      ],
    },
    feedback: "This is a dog",
    hint: "It barks",
    active: true,
  },
  {
    question_id: 4,
    question_uid: "test-uid-4",
    question_type: "match",
    question_stem: [
      {
        text: "Match the countries to their capitals",
        type: "text",
      },
    ],
    answers: {
      match: [
        {
          match_option: [{ text: "France", type: "text" }],
          correct_choice: [{ text: "Paris", type: "text" }],
        },
        {
          match_option: [{ text: "Germany", type: "text" }],
          correct_choice: [{ text: "Berlin", type: "text" }],
        },
      ],
    },
    feedback: "Well done!",
    hint: "Think about European geography",
    active: true,
  },
  {
    question_id: 5,
    question_uid: "test-uid-5",
    question_type: "order",
    question_stem: [
      {
        text: "Put these numbers in ascending order",
        type: "text",
      },
    ],
    answers: {
      order: [
        { answer: [{ text: "1", type: "text" }], correct_order: 1 },
        { answer: [{ text: "3", type: "text" }], correct_order: 2 },
        { answer: [{ text: "5", type: "text" }], correct_order: 3 },
      ],
    },
    feedback: "Correct order!",
    hint: "Start with the smallest",
    active: true,
  },
  {
    question_id: 6,
    question_uid: "test-uid-6",
    question_type: "explanatory-text",
    question_stem: [
      {
        text: "This is just explanatory text",
        type: "text",
      },
    ],
    answers: {
      "explanatory-text": null,
    },
    feedback: "",
    hint: "",
    active: true,
  },
];
