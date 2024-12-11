import type { Meta, StoryObj } from "@storybook/react";

import { chromaticParams } from "../../../.storybook/chromatic";
import { LegacyUpgradeNotice } from "./LegacyUpgradeNotice";

const meta: Meta<typeof LegacyUpgradeNotice> = {
  title: "Pages/Onboarding/LegacyUpgradeNotice",
  component: LegacyUpgradeNotice,
  parameters: {
    ...chromaticParams(["mobile", "desktop"]),
  },
};

export default meta;
type Story = StoryObj<typeof LegacyUpgradeNotice>;

export const Default: Story = {
  args: {},
};
