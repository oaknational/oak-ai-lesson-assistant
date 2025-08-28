import type { Meta, StoryObj } from "@storybook/react";

import { chromaticParams } from "@/storybook/chromatic";

import { OrderQuestion } from "./OrderQuestion";

const meta = {
  title: "Components/Quiz/OrderQuestion",
  component: OrderQuestion,
  parameters: {
    layout: "padded",
    ...chromaticParams(["desktop", "mobile"]),
  },
  tags: ["autodocs"],
} satisfies Meta<typeof OrderQuestion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    question: {
      questionType: "order",
      question:
        "Put these historical events in chronological order, from earliest to most recent.",
      items: [
        "The Industrial Revolution begins",
        "World War I ends",
        "The internet is invented",
        "The fall of the Berlin Wall",
      ],
      hint: null,
    },
    questionNumber: 4,
    imageMetadata: [],
  },
};
