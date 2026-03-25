import type { PersistedModerationBase } from "@oakai/core/src/utils/ailaModeration/moderationSchema";

import type { Meta, StoryObj } from "@storybook/nextjs";

import { chromaticParams } from "@/storybook/chromatic";
import { StoreDecorator } from "@/storybook/decorators/StoreDecorator";

import { LockingModerationModal } from "./locking-moderation-modal";

const meta = {
  title: "Components/Dialogs/LockingModerationModal",
  component: LockingModerationModal,
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
} satisfies Meta<typeof LockingModerationModal>;

export default meta;
type Story = StoryObj<typeof meta>;
