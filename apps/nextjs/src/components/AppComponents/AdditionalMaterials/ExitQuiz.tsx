import React from "react";

import type { ExitQuiz as ExitQuizType } from "@oakai/additional-materials/src/documents/additionalMaterials/exitQuiz/schema";

import { Quiz } from "./Quiz";

type ExitQuizProps = {
  action: string;
  generation: ExitQuizType;
};

const quizData = {
  year: "key-stage-2",
  subject: "Maths",
  title: "Understanding multiplication and arrays",
  questions: [
    {
      question: "What is 3 multiplied by 4?",
      options: [
        {
          text: "12",
          isCorrect: true,
        },
        {
          text: "7",
          isCorrect: false,
        },
        {
          text: "9",
          isCorrect: false,
        },
      ],
    },
    {
      question: "Which of these is an array?",
      options: [
        {
          text: "3 rows of 4 apples",
          isCorrect: true,
        },
        {
          text: "A single line of apples",
          isCorrect: false,
        },
        {
          text: "A pile of apples",
          isCorrect: false,
        },
      ],
    },
    {
      question: "How many objects are in an array with 2 rows and 5 columns?",
      options: [
        {
          text: "10",
          isCorrect: true,
        },
        {
          text: "7",
          isCorrect: false,
        },
        {
          text: "12",
          isCorrect: false,
        },
      ],
    },
    {
      question: "What does the term 'row' mean in an array?",
      options: [
        {
          text: "A horizontal line of objects",
          isCorrect: true,
        },
        {
          text: "A vertical line of objects",
          isCorrect: false,
        },
        {
          text: "A diagonal line of objects",
          isCorrect: false,
        },
      ],
    },
    {
      question: "If you have 4 rows of 3, what is the multiplication sentence?",
      options: [
        {
          text: "4 x 3",
          isCorrect: true,
        },
        {
          text: "3 x 4",
          isCorrect: false,
        },
        {
          text: "4 + 3",
          isCorrect: false,
        },
      ],
    },
    {
      question: "Which multiplication fact is shown by 5 rows of 2?",
      options: [
        {
          text: "5 x 2",
          isCorrect: true,
        },
        {
          text: "2 x 5",
          isCorrect: false,
        },
        {
          text: "5 + 2",
          isCorrect: false,
        },
      ],
    },
    {
      question: "What is the result of 6 x 0?",
      options: [
        {
          text: "0",
          isCorrect: true,
        },
        {
          text: "6",
          isCorrect: false,
        },
        {
          text: "1",
          isCorrect: false,
        },
      ],
    },
    {
      question: "How can you use an array to solve 3 x 5?",
      options: [
        {
          text: "3 rows of 5 objects",
          isCorrect: true,
        },
        {
          text: "5 rows of 3 objects",
          isCorrect: false,
        },
        {
          text: "3 rows of 3 objects",
          isCorrect: false,
        },
      ],
    },
    {
      question: "Which statement is true about multiplication?",
      options: [
        {
          text: "It is repeated addition",
          isCorrect: true,
        },
        {
          text: "It always makes numbers bigger",
          isCorrect: false,
        },
        {
          text: "It is the same as subtraction",
          isCorrect: false,
        },
      ],
    },
    {
      question: "How many columns are in an array of 4 x 3?",
      options: [
        {
          text: "3",
          isCorrect: true,
        },
        {
          text: "4",
          isCorrect: false,
        },
        {
          text: "7",
          isCorrect: false,
        },
      ],
    },
  ],
};

export const ExitQuiz = ({ action, generation }: ExitQuizProps) => {
  return <Quiz generation={quizData} />;
};
