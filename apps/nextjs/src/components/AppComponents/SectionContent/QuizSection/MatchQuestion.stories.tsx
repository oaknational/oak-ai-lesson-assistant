import type { Meta, StoryObj } from "@storybook/react";

import { MatchQuestion } from "./MatchQuestion";

const meta = {
  title: "Components/Quiz/MatchQuestion",
  component: MatchQuestion,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof MatchQuestion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BasicMatch: Story = {
  args: {
    question: {
      questionType: "match",
      question: "Match question stem. Write the matching letter in each box.",
      pairs: [
        { left: "Match item one", right: "Match item three" },
        {
          left: "Match item two",
          right: "Match item one with a long option here",
        },
        { left: "Match item three", right: "Match item two" },
      ],
      hint: null,
    },
    questionNumber: 6,
  },
};

export const CapitalCities: Story = {
  args: {
    question: {
      questionType: "match",
      question: "Match the capital cities to their countries.",
      pairs: [
        { left: "France", right: "Paris" },
        { left: "Germany", right: "Berlin" },
        { left: "Spain", right: "Madrid" },
        { left: "Italy", right: "Rome" },
      ],
      hint: null,
    },
    questionNumber: 3,
  },
};
