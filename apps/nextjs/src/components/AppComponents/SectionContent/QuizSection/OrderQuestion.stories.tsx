import type { Meta, StoryObj } from "@storybook/react";

import { OrderQuestion } from "./OrderQuestion";

const meta = {
  title: "Components/Quiz/OrderQuestion",
  component: OrderQuestion,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof OrderQuestion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BasicOrder: Story = {
  args: {
    question: {
      questionType: "order",
      question: "Order question stem. Place the options in the correct order.",
      items: [
        "Evaporation from oceans and lakes",
        "Condensation in clouds",
        "Precipitation as rain or snow",
        "Collection in rivers and groundwater",
      ],
    },
    questionNumber: 7,
  },
};

export const HistoricalEvents: Story = {
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
    },
    questionNumber: 4,
  },
};
