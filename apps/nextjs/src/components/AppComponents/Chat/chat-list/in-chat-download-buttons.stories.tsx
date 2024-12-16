import type { Meta, StoryObj } from "@storybook/react";

import {
  DemoDecorator,
  demoParams,
} from "@/storybook/decorators/DemoDecorator";

import { InChatDownloadButtons } from "./in-chat-download-buttons";

const meta: Meta<typeof InChatDownloadButtons> = {
  title: "Components/Chat/InChatDownloadButtons",
  component: InChatDownloadButtons,
  tags: ["autodocs"],
  args: {
    id: "test-chat-id",
  },
  decorators: [DemoDecorator],
  parameters: {
    ...demoParams({ isDemoUser: true }),
  },
};

export default meta;
type Story = StoryObj<typeof InChatDownloadButtons>;

export const Default: Story = {};

export const SharingDisabled: Story = {
  parameters: {
    ...demoParams({ isDemoUser: true, isSharingEnabled: false }),
  },
};
