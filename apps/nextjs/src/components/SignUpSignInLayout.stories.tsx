import type { Meta, StoryObj } from "@storybook/react";

import SignUpSignInLayout from "./SignUpSignInLayout";

const meta: Meta<typeof SignUpSignInLayout> = {
  title: "Components/Layout/SignUpSignInLayout",
  component: SignUpSignInLayout,
};

export default meta;
type Story = StoryObj<typeof SignUpSignInLayout>;

export const Default: Story = {
  args: {},
};
