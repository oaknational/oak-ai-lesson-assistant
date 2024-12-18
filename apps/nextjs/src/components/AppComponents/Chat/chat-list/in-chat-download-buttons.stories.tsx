import type { Meta, StoryObj } from "@storybook/react";

import {
  DemoDecorator,
  demoParams,
} from "@/storybook/decorators/DemoDecorator";

import { InChatDownloadButtons } from "./in-chat-download-buttons";

const meta = {
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
} satisfies Meta<typeof InChatDownloadButtons>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SharingDisabled: Story = {
  parameters: {
    ...demoParams({ isDemoUser: true, isSharingEnabled: false }),
  },
};
