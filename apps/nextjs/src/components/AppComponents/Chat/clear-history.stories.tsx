import type { Meta, StoryObj } from "@storybook/react";

import { chromaticParams } from "@/storybook/chromatic";

import { ClearHistory } from "./clear-history";

const meta = {
  title: "Components/Sidebar/ClearHistory",
  component: ClearHistory,
  tags: ["autodocs"],
  argTypes: {
    isEnabled: { control: "boolean" },
  },
  parameters: {
    ...chromaticParams(["desktop"]),
  },
  decorators: [
    (Story) => {
      return <Story />;
    },
  ],
} satisfies Meta<typeof ClearHistory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isEnabled: true,
  },
};

export const Disabled: Story = {
  args: {
    isEnabled: false,
  },
};

export const WithError: Story = {
  args: {
    isEnabled: true,
  },
};
