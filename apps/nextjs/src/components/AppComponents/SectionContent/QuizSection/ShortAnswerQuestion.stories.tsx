import type { Meta, StoryObj } from "@storybook/react";

import { chromaticParams } from "@/storybook/chromatic";

import { ShortAnswerQuestion } from "./ShortAnswerQuestion";

const meta = {
  title: "Components/Quiz/ShortAnswerQuestion",
  component: ShortAnswerQuestion,
  parameters: {
    layout: "padded",
    ...chromaticParams(["desktop"]),
  },
} satisfies Meta<typeof ShortAnswerQuestion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InlineAnswer: Story = {
  args: {
    question: {
      questionType: "short-answer",
      question: "The capital of France is [answer].",
      answers: ["Paris"],
      hint: null,
    },
    questionNumber: 1,
  },
};

export const SeparateAnswer: Story = {
  args: {
    question: {
      questionType: "short-answer",
      question: "What is the value of x if 2x = 10?",
      answers: ["5", "x = 5", "x=5"],
      hint: null,
    },
    questionNumber: 4,
  },
};
