import type { Meta, StoryObj } from "@storybook/react";

import { AccountLocked } from "./account-locked";

const meta: Meta<typeof AccountLocked> = {
  title: "Pages/Legal/Account Locked",
  component: AccountLocked,
};

export default meta;
type Story = StoryObj<typeof AccountLocked>;

export const Default: Story = {
  args: {},
};
