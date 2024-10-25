import type { Meta, StoryObj } from "@storybook/react";

import { ChatHistory } from "./chat-history";
import { Dialog } from "./ui/dialog";

const meta: Meta<typeof ChatHistory> = {
  title: "Components/Chat/ChatHistory",
  component: ChatHistory,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ChatHistory>;

export const Default: Story = {
  render: () => (
    <Dialog>
      <ChatHistory />
    </Dialog>
  ),
  args: {
    userId: "user123",
  },
};

export const WithoutUserId: Story = {
  render: () => (
    <Dialog>
      <ChatHistory />
    </Dialog>
  ),
  args: {},
};
