import type { Meta, StoryObj } from "@storybook/react";

import { DemoContext } from "@/components/ContextProviders/Demo";

import { InChatDownloadButtons } from "./in-chat-download-buttons";

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

const meta: Meta<typeof InChatDownloadButtons> = {
  title: "Components/Chat/InChatDownloadButtons",
  component: InChatDownloadButtons,
  tags: ["autodocs"],
  args: {
    id: "test-chat-id",
  },
  decorators: [DemoDecorator],
};

export default meta;
type Story = StoryObj<typeof InChatDownloadButtons>;

export const Default: Story = {};

export const SharingDisabled: Story = {
  parameters: {
    demoContext: {
      isSharingEnabled: false,
    },
  },
};
