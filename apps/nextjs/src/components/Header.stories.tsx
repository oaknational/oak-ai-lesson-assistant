import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import { chromaticParams } from "@/storybook/chromatic";
import {
  DemoDecorator,
  demoParams,
} from "@/storybook/decorators/DemoDecorator";

import Header from "./Header";

const meta = {
  title: "Components/Layout/Header",
  component: Header,
  tags: ["autodocs"],
  decorators: [DemoDecorator],
  parameters: {
    layout: "fullscreen",
    docs: {
      story: {
        height: "80px",
      },
    },
    ...chromaticParams(["desktop"]),
    ...demoParams({ isDemoUser: false }),
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

export const DemoUser: Story = {
  args: {},
  parameters: {
    auth: "signedInDemo",
    ...demoParams({
      isDemoUser: true,
      demo: {
        appSessionsPerMonth: 3,
        appSessionsRemaining: 2,
      },
    }),
  },
};
