import type { Meta, StoryObj } from "@storybook/react";

import { chromaticParams } from "@/storybook/chromatic";
import {
  DemoDecorator,
  demoParams,
} from "@/storybook/decorators/DemoDecorator";

import { Header } from "./header";

const meta = {
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
    ...demoParams({ isDemoUser: false }),
    ...chromaticParams(["desktop"]),
  },
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const DemoUser: Story = {
  args: {},
  parameters: {
    ...demoParams({
      isDemoUser: true,
      demo: {
        appSessionsPerMonth: 3,
        appSessionsRemaining: 2,
      },
    }),
    ...chromaticParams(["desktop", "desktop-wide"]),
  },
};

export const DemoLoading: Story = {
  args: {},
  parameters: {
    ...demoParams({
      isDemoUser: true,
      demo: {
        appSessionsPerMonth: 3,
        appSessionsRemaining: undefined,
      },
    }),
  },
};
