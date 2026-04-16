import type { PersistedModerationBase } from "@oakai/core/src/utils/ailaModeration/moderationSchema";

import type { Meta, StoryObj } from "@storybook/nextjs";

import { chromaticParams } from "@/storybook/chromatic";
import { StoreDecorator } from "@/storybook/decorators/StoreDecorator";

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
    StoreDecorator,
  ],
  parameters: {
    ...chromaticParams(["desktop"]),
  },
} satisfies Meta<typeof ChatModerationDisplay>;

export default meta;
type Story = StoryObj<typeof meta>;

const toxicModeration: PersistedModerationBase = {
  id: "mock-moderation-id",
  categories: ["t/encouragement-violence"],
};

const highlySensitiveModeration: PersistedModerationBase = {
  id: "mock-moderation-id",
  categories: ["n/self-harm-suicide"],
};

export const WithToxicModeration: Story = {
  args: {
    lockingModeration: toxicModeration,
    chatId: "mock-chat-id",
  },
};

export const WithHighlySensitiveModeration: Story = {
  args: {
    lockingModeration: highlySensitiveModeration,
    chatId: "mock-chat-id",
  },
};
