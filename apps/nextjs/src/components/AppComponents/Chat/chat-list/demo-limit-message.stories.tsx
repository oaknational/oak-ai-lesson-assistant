import type { Meta, StoryObj } from "@storybook/react";

import { ChatModerationProvider } from "@/components/ContextProviders/ChatModerationContext";

import { DemoLimitMessage } from "./demo-limit-message";

const meta: Meta<typeof DemoLimitMessage> = {
  title: "Components/Chat/DemoLimitMessage",
  component: DemoLimitMessage,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <ChatModerationProvider chatId="test-chat-id">
        <Story />
      </ChatModerationProvider>
    ),
    // ChatDecorator,
    // DemoDecorator,
  ],
};

export default meta;
type Story = StoryObj<typeof DemoLimitMessage>;

export const Default: Story = {
  args: {},
};
