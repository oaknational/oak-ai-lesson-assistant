import type { PersistedModerationBase } from "@oakai/core/src/utils/ailaModeration/moderationSchema";

import type { Meta, StoryObj } from "@storybook/react";

import { chromaticParams } from "@/storybook/chromatic";

import { GuidanceRequired } from "./guidance-required";

const meta = {
  title: "Components/Chat/GuidanceRequired",
  component: GuidanceRequired,
  tags: ["autodocs"],
  parameters: {
    ...chromaticParams(["desktop"]),
  },
} satisfies Meta<typeof GuidanceRequired>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockModeration: PersistedModerationBase = {
  id: "moderated",
  categories: ["l/strong-language"],
};

export const Default: Story = {
  args: {
    moderation: mockModeration,
  },
};

export const NoModeration: Story = {
  args: {
    moderation: {
      id: "safe",
      categories: [],
    },
  },
  decorators: [
    (Story) => (
      <>
        <Story />
        <p>(Nothing should render here)</p>
      </>
    ),
  ],
};
