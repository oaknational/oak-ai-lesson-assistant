import type { Meta, StoryObj } from "@storybook/react";

import ChatUserAccessCheck from "./ChatUserAccessCheck";

const meta: Meta<typeof ChatUserAccessCheck> = {
  title: "Components/Chat/ChatUserAccessCheck",
  component: ChatUserAccessCheck,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ChatUserAccessCheck>;

export const UserHasAccess: Story = {
  args: {
    userCanView: true,
    children: <div>Content that the user can view</div>,
  },
};

export const UserDeniedAccess: Story = {
  args: {
    userCanView: false,
    children: <div>Content that should not be visible</div>,
  },
};
