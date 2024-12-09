import type { Meta, StoryObj } from "@storybook/react";

import { DemoContext } from "@/components/ContextProviders/Demo";

import { chromaticParams } from "../../../../.storybook/chromatic";
import { Header } from "./header";

const DemoDecorator: Story["decorators"] = (Story, { parameters }) => (
  <DemoContext.Provider
    value={{
      isDemoUser: false,
      isSharingEnabled: true,
      ...parameters.demoContext,
    }}
  >
    <Story />
  </DemoContext.Provider>
);

const meta: Meta<typeof Header> = {
  title: "Components/Layout/ChatHeader",
  component: Header,
  tags: ["autodocs"],
  decorators: [DemoDecorator],
  parameters: {
    layout: "fullscreen",
    ...chromaticParams(["legacy"]),
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
      appSessionsPerMonth: 3,
      appSessionsRemaining: 2,
    },
    ...chromaticParams(["legacy", "desktop-wide"]),
  },
};

export const DemoLoading: Story = {
  args: {},
  parameters: {
    demoContext: {
      isDemoUser: true,
      appSessionsPerMonth: 3,
      appSessionsRemaining: undefined,
    },
  },
};
