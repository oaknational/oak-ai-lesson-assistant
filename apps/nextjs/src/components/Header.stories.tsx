import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import Header from "./Header";

const meta = {
  title: "Components/Layout/Header",
  component: Header,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      story: {
        height: "80px",
      },
    },
  },
  args: {
    menuOpen: false,
    setMenuOpen: fn(),
  },
} satisfies Meta<typeof Header>;

export default meta;

type Story = StoryObj<typeof meta>;

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
