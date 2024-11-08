import * as Dialog from "@radix-ui/react-dialog";
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
      <Dialog.Root>
        <Story />
      </Dialog.Root>
    ),
  ],
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
