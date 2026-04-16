import type { Meta, StoryObj } from "@storybook/nextjs";

import { chromaticParams } from "@/storybook/chromatic";

import { ShortAnswerQuestion } from "./ShortAnswerQuestion";

const meta = {
  title: "Components/Quiz/ShortAnswerQuestion",
  component: ShortAnswerQuestion,
  parameters: {
    layout: "padded",
    ...chromaticParams(["desktop"]),
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ShortAnswerQuestion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InlineAnswer: Story = {
  args: {
    question: {
      questionType: "short-answer",
      question: "Plants need water, warmth and {{}} to grow and stay healthy.",
      answers: ["sunlight"],
      hint: null,
    },
    questionNumber: 1,
  },
};

export const InlineAnswerWithSpaces: Story = {
  args: {
    question: {
      questionType: "short-answer",
      question: "The capital of France is {{ }}.",
      answers: ["Paris"],
      hint: null,
    },
    questionNumber: 2,
  },
};

export const InlineAnswerWithDegrees: Story = {
  args: {
    question: {
      questionType: "short-answer",
      question: "The boiling temperature of water is {{ }}°C",
      answers: ["100"],
      hint: null,
    },
    questionNumber: 2,
  },
};

export const SeparateAnswer: Story = {
  args: {
    question: {
      questionType: "short-answer",
      question:
        "What is the process by which plants make their own food using sunlight?",
      answers: ["photosynthesis"],
      hint: null,
    },
    questionNumber: 4,
  },
};
