import type { PersistedModerationBase } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import type { Meta, StoryObj } from "@storybook/react";

import { ChatModerationDisplay } from "./ChatModerationDisplay";

const meta = {
  title: "Components/Dialogs/ChatModerationDisplay",
  component: ChatModerationDisplay,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="min-h-screen">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChatModerationDisplay>;

export default meta;
type Story = StoryObj<typeof meta>;

const toxicModeration: PersistedModerationBase = {
  id: "mock-moderation-id",
  categories: ["l/discriminatory-behaviour"],
};

export const WithModeration: Story = {
  args: {
    toxicModeration,
    chatId: "mock-chat-id",
  },
};

export const WithoutModeration: Story = {
  args: {
    toxicModeration: null,
    chatId: "mock-chat-id",
  },
};
