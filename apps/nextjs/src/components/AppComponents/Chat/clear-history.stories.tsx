import type { Meta, StoryObj } from "@storybook/react";

import { ClearHistory } from "./clear-history";

const meta: Meta<typeof ClearHistory> = {
  title: "Components/Sidebar/ClearHistory",
  component: ClearHistory,
  tags: ["autodocs"],
  argTypes: {
    isEnabled: { control: "boolean" },
  },
  decorators: [
    (Story) => {
      return <Story />;
    },
  ],
};

export default meta;
type Story = StoryObj<typeof ClearHistory>;

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
