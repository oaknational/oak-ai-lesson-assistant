import type { Meta, StoryObj } from "@storybook/react";

import { chromaticParams } from "@/storybook/chromatic";

import { MultipleChoiceQuestion } from "./MultipleChoiceQuestion";

const meta = {
  title: "Components/Quiz/MultipleChoiceQuestion",
  component: MultipleChoiceQuestion,
  parameters: {
    layout: "padded",
    ...chromaticParams(["desktop", "mobile"]),
  },
  tags: ["autodocs"],
} satisfies Meta<typeof MultipleChoiceQuestion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    question: {
      questionType: "multiple-choice",
      question: "What is the capital city of France?",
      answers: ["Paris"],
      distractors: ["London", "Berlin", "Madrid"],
      hint: null,
    },
    questionNumber: 1,
    imageMetadata: [],
  },
};

export const LongAnswers: Story = {
  args: {
    question: {
      questionType: "multiple-choice",
      question:
        "Which of the following best describes the process of photosynthesis?",
      answers: [
        "Plants convert light energy into chemical energy, using carbon dioxide and water to produce glucose and oxygen",
      ],
      distractors: [
        "Plants absorb oxygen and release carbon dioxide during the night",
        "Plants break down glucose to release energy for cellular processes",
        "Plants transport water from roots to leaves through xylem vessels",
      ],
      hint: null,
    },
    questionNumber: 4,
    imageMetadata: [],
  },
};

export const MultipleCorrectAnswers: Story = {
  args: {
    question: {
      questionType: "multiple-choice",
      question: "Select all the prime numbers:",
      answers: ["2", "3", "5"],
      distractors: ["4", "6", "9"],
      hint: null,
    },
    questionNumber: 3,
    imageMetadata: [],
  },
};

export const WithUnfilledBlanks: Story = {
  args: {
    question: {
      questionType: "multiple-choice",
      question: "A full rotation is {{}}° around a circle.",
      answers: ["360"],
      distractors: ["180", "90", "45"],
      hint: null,
    },
    questionNumber: 4,
    imageMetadata: [],
  },
};
