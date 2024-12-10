import type { Meta, StoryObj } from "@storybook/react";

import { DemoDecorator } from "@/storybook/decorators/DemoDecorator";

import { InChatDownloadButtons } from "./in-chat-download-buttons";

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
