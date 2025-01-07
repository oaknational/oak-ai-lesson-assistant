import type { Meta, StoryObj } from "@storybook/react";

import { chromaticParams } from "@/storybook/chromatic";

import SignUpSignInLayout from "./SignUpSignInLayout";

const meta = {
  title: "Components/Layout/SignUpSignInLayout",
  component: SignUpSignInLayout,
  parameters: {
    ...chromaticParams(["desktop"]),
  },
} satisfies Meta<typeof SignUpSignInLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: null,
    loaded: true,
  },
};
