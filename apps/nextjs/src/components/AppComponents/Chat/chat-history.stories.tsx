import * as Dialog from "@radix-ui/react-dialog";
import type { Meta, StoryObj } from "@storybook/react";

import { chromaticParams } from "@/storybook/chromatic";

import { ChatHistory } from "./chat-history";

const meta = {
  title: "Components/Sidebar/ChatHistory",
  component: ChatHistory,
  parameters: {
    layout: "centered",
    ...chromaticParams(["desktop"]),
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <Dialog.Root>
        <Story />
      </Dialog.Root>
    ),
  ],
} satisfies Meta<typeof ChatHistory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithoutUserId: Story = {
  args: {},
};
