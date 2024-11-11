import type { Meta, StoryObj } from "@storybook/react";

import { ChatHistory } from "./chat-history";
import { Dialog } from "./ui/dialog";

const meta: Meta<typeof ChatHistory> = {
  title: "Components/Sidebar/ChatHistory",
  component: ChatHistory,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <Dialog>
        <Story />
      </Dialog>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ChatHistory>;

export const Default: Story = {
  render: () => <ChatHistory />,
  args: {
    userId: "user123",
  },
};

export const WithoutUserId: Story = {
  render: () => <ChatHistory />,
  args: {},
};
