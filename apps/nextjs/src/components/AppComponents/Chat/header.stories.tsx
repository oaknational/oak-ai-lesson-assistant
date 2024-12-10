import type { Meta, StoryObj } from "@storybook/react";

import { chromaticParams } from "@/storybook/chromatic";
import { DemoDecorator } from "@/storybook/decorators/DemoDecorator";

import { Header } from "./header";

const meta: Meta<typeof Header> = {
  title: "Components/Layout/ChatHeader",
  component: Header,
  tags: ["autodocs"],
  decorators: [DemoDecorator],
  parameters: {
    layout: "fullscreen",
    docs: {
      story: {
        height: "150px",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Header>;

export const Default: Story = {
  args: {},
};

export const DemoUser: Story = {
  args: {},
  parameters: {
    demoContext: {
      isDemoUser: true,
      demo: {
        appSessionsPerMonth: 3,
        appSessionsRemaining: 2,
      },
    },
    ...chromaticParams(["desktop", "desktop-wide"]),
  },
};

export const DemoLoading: Story = {
  args: {},
  parameters: {
    demoContext: {
      isDemoUser: true,
      demo: {
        appSessionsPerMonth: 3,
        appSessionsRemaining: undefined,
      },
    },
  },
};
