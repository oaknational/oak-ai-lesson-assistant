import type { Meta, StoryObj } from "@storybook/react";

import ShareChat from "./";

const meta: Meta<typeof ShareChat> = {
  title: "Pages/Chat/Share",
  component: ShareChat,
};

export default meta;
type Story = StoryObj<typeof ShareChat>;

export const Default: Story = {
  args: {},
};
