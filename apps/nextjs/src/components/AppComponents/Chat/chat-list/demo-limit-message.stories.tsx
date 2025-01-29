import type { Meta, StoryObj } from "@storybook/react";

import { ChatModerationProvider } from "@/components/ContextProviders/ChatModerationContext";
import { chromaticParams } from "@/storybook/chromatic";

import { DemoLimitMessage } from "./demo-limit-message";

const meta = {
  title: "Components/Chat/DemoLimitMessage",
  component: DemoLimitMessage,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <ChatModerationProvider chatId="test-chat-id">
        <Story />
      </ChatModerationProvider>
    ),
  ],
  args: {
    id: "test-chat-id",
  },
  parameters: {
    ...chromaticParams(["desktop"]),
  },
} satisfies Meta<typeof DemoLimitMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
