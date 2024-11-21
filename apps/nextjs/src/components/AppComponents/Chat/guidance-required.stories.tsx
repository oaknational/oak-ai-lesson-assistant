import type { PersistedModerationBase } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import type { Meta, StoryObj } from "@storybook/react";

import { GuidanceRequired } from "./guidance-required";

const meta: Meta<typeof GuidanceRequired> = {
  title: "Components/Chat/GuidanceRequired",
  component: GuidanceRequired,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof GuidanceRequired>;

const mockModeration: PersistedModerationBase = {
  id: "moderated",
  categories: ["l/strong-language"],
};

export const Default: Story = {
  args: {
    moderation: mockModeration,
  },
};

export const CustomClass: Story = {
  args: {
    moderation: mockModeration,
    className: "custom-class",
  },
};

export const Safe: Story = {
  args: {
    moderation: {
      id: "safe",
      categories: [],
    },
  },
};
