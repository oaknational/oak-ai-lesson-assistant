import type { PersistedModerationBase } from "@oakai/core/src/utils/ailaModeration/moderationSchema";

import type { Meta, StoryObj } from "@storybook/nextjs";

import { chromaticParams } from "@/storybook/chromatic";
import { StoreDecorator } from "@/storybook/decorators/StoreDecorator";

import { ToxicContentModal } from "./toxic-content-modal";

const meta = {
  title: "Components/Dialogs/ToxicContentModal",
  component: ToxicContentModal,
  tags: ["autodocs"],
  decorators: [StoreDecorator],
  parameters: {
    ...chromaticParams(["desktop"]),
  },
  args: {
    open: true,
    onClose: () => {},
    chatId: "mock-chat-id",
    moderation: {
      id: "mock-moderation-id",
      categories: ["l/discriminatory-behaviour"],
    } satisfies PersistedModerationBase,
  },
} satisfies Meta<typeof ToxicContentModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Alert: Story = {};
