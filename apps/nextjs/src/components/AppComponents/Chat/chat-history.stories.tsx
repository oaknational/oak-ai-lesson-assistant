import type { Meta, StoryObj } from "@storybook/react";

import { ChatHistory } from "./chat-history";

const meta: Meta<typeof ChatHistory> = {
  title: "Components/Sidebar/ChatHistory",
  component: ChatHistory,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ChatHistory>;

export const Default: Story = {
  args: {
    userId: "user123",
  },
};

export const WithoutUserId: Story = {
  args: {},
};
