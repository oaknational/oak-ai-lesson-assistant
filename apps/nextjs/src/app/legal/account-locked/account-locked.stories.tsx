import type { Meta, StoryObj } from "@storybook/react";

import { chromaticParams } from "../../../../.storybook/chromatic";
import { AccountLocked } from "./account-locked";

const meta: Meta<typeof AccountLocked> = {
  title: "Pages/Legal/Account Locked",
  component: AccountLocked,
  parameters: {
    ...chromaticParams(["mobile", "desktop"]),
  },
};

export default meta;
type Story = StoryObj<typeof AccountLocked>;

export const Default: Story = {
  args: {},
};
