import type { Moderation as ModerationType } from "@prisma/client";
import type { Meta, StoryObj } from "@storybook/react";

import { ChatModerationProvider } from "@/components/ContextProviders/ChatModerationContext";
import { chromaticParams } from "@/storybook/chromatic";
import { StoreDecorator } from "@/storybook/decorators/StoreDecorator";

import { Moderation } from "./ModerationMessage";

const meta = {
  title: "Components/Chat/ModerationMessage",
  component: Moderation,
  tags: ["autodocs"],
  args: {
    forMessage: {
      id: "test-message-id",
      role: "assistant",
      content: "test-message-text",
      parts: [
        {
          type: "message-part",
          id: "test-part-id",
          isPartial: false,
          document: {
            type: "moderation",
            id: "test-document-id",
            categories: [],
          },
        },
      ],
      hasError: false,
      isEditing: false,
    },
  },
  decorators: [
    (Story) => (
      <ChatModerationProvider chatId="test-chat-id">
        <Story />
      </ChatModerationProvider>
    ),
    StoreDecorator,
  ],
  parameters: {
    ...chromaticParams(["desktop"]),
    moderationStoreState: {
      moderations: [
        {
          messageId: "test-message-id",
          id: "test-moderation-id",
          categories: ["l/strong-language"],
        } as unknown as ModerationType,
      ],
    },
  },
} satisfies Meta<typeof Moderation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
