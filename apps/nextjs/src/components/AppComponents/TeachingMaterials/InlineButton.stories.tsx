import type { Meta, StoryObj } from "@storybook/nextjs";

import { chromaticParams } from "@/storybook/chromatic";

import InlineButton from "./InlineButton";

const meta = {
  title: "Components/TeachingMaterials/InlineButton",
  component: InlineButton,

  parameters: {
    ...chromaticParams(["desktop"]),
    layout: "centered",
  },
} satisfies Meta<typeof InlineButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onClick: () => console.log("Button clicked"),
    children: "Click me",
  },
};

export const LongText: Story = {
  args: {
    onClick: () => console.log("Button clicked"),
    children: "This is a longer button text example",
  },
};
