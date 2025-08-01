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
      question: "Plants need water, warmth and {{}} to grow and stay healthy.",
      answers: ["sunlight"],
      hint: null,
    },
    questionNumber: 1,
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
