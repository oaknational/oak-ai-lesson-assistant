import type { PersistedModerationBase } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import type { Meta, StoryObj } from "@storybook/react";

import { ChatModerationDisplay } from "./ChatModerationDisplay";

const meta: Meta<typeof ChatModerationDisplay> = {
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
};

export default meta;
type Story = StoryObj<typeof ChatModerationDisplay>;

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
