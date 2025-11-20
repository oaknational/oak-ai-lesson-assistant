import type { Meta, StoryObj } from "@storybook/nextjs";

import { chromaticParams } from "@/storybook/chromatic";

import { MatchQuestion } from "./MatchQuestion";

const meta = {
  title: "Components/Quiz/MatchQuestion",
  component: MatchQuestion,
  parameters: {
    layout: "padded",
    ...chromaticParams(["mobile", "desktop"]),
  },
  tags: ["autodocs"],
} satisfies Meta<typeof MatchQuestion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CapitalCities: Story = {
  args: {
    question: {
      questionType: "match",
      question: "Match the countries to their capital cities.",
      pairs: [
        { left: "France", right: "Paris" },
        { left: "Germany", right: "Berlin" },
        { left: "Spain", right: "Madrid" },
        { left: "Italy", right: "Rome" },
      ],
      hint: null,
    },
    questionNumber: 6,
  },
};

export const LiteraryTerms: Story = {
  args: {
    question: {
      questionType: "match",
      question: "Match the literary terms to their definitions.",
      pairs: [
        {
          left: "Alliteration",
          right: "Repetition of consonant sounds at the beginning of words",
        },
        {
          left: "Metaphor",
          right: "A direct comparison between two unlike things",
        },
        {
          left: "Personification",
          right: "Giving human qualities to non-human things",
        },
        {
          left: "Onomatopoeia",
          right: "Words that imitate the sound they describe",
        },
        {
          left: "Hyperbole",
          right: "Extreme exaggeration for emphasis",
        },
      ],
      hint: null,
    },
    questionNumber: 3,
  },
};
