import type { Meta, StoryObj } from "@storybook/react";

import { chromaticParams } from "@/storybook/chromatic";

import { AccountLocked } from "./account-locked";

const meta = {
  title: "Pages/Legal/Account Locked",
  component: AccountLocked,
  parameters: {
    ...chromaticParams(["mobile", "desktop"]),
  },
} satisfies Meta<typeof AccountLocked>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
