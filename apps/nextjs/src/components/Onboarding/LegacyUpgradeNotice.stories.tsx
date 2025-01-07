import type { Meta, StoryObj } from "@storybook/react";

import { chromaticParams } from "@/storybook/chromatic";

import { LegacyUpgradeNotice } from "./LegacyUpgradeNotice";

const meta = {
  title: "Pages/Onboarding/LegacyUpgradeNotice",
  component: LegacyUpgradeNotice,
  parameters: {
    ...chromaticParams(["mobile", "desktop"]),
  },
} satisfies Meta<typeof LegacyUpgradeNotice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
