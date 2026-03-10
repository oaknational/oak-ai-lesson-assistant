import type { Moderation as ModerationType } from "@prisma/client";
import type { Meta, StoryObj } from "@storybook/nextjs";

import type { ParsedMessage } from "@/stores/chatStore/types";
import { chromaticParams } from "@/storybook/chromatic";
import { StoreDecorator } from "@/storybook/decorators/StoreDecorator";

import { Moderation } from "./ModerationMessage";

const forMessage: ParsedMessage = {
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
};

function withCategories(categories: string[]) {
  return {
    moderationStoreState: {
      moderations: [
        {
          messageId: "test-message-id",
          id: "test-moderation-id",
          categories,
        } as unknown as ModerationType,
      ],
    },
  };
}

const meta = {
  title: "Components/Chat/ModerationMessage",
  component: Moderation,
  tags: ["autodocs"],
  args: { forMessage },
  decorators: [StoreDecorator],
  parameters: {
    ...chromaticParams(["desktop"]),
    ...withCategories(["l/discriminatory-language"]),
  },
} satisfies Meta<typeof Moderation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ContentGuidance: Story = {};

export const EnhancedScrutiny: Story = {
  parameters: withCategories(["r/recent-content"]),
};

export const HeightenedCaution: Story = {
  parameters: withCategories(["e/rshe-content"]),
};

export const MultipleCategories: Story = {
  parameters: withCategories([
    "l/discriminatory-language",
    "u/violence-or-suffering",
  ]),
};
