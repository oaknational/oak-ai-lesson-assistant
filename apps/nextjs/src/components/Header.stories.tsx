import type { Meta, StoryObj } from "@storybook/react";

import Header from "./Header";

const meta: Meta<typeof Header> = {
  title: "Components/Layout/Header",
  component: Header,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Header>;

export const SignedIn: Story = {
  args: {},
  parameters: {
    auth: "signedIn",
  },
};

export const SignedOut: Story = {
  args: {},
  parameters: {
    auth: "signedOut",
  },
};
