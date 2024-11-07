import type { Meta, StoryObj } from "@storybook/react";
import { within } from "@storybook/test";

import { SidebarActions } from "./sidebar-actions";

const meta: Meta<typeof SidebarActions> = {
  title: "Components/Sidebar/Actions",
  component: SidebarActions,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof SidebarActions>;

const mockChat = {
  id: "1",
  title: "Mock chat title",
  isShared: false,
};

export const Default: Story = {
  args: {
    chat: mockChat,
  },
};

export const SharePending: Story = {
  args: {
    ...Default.args,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const deleteButton = canvas.getByRole("button", { name: "Share" });
    deleteButton.click();
  },
};

export const RemovePending: Story = {
  args: {
    ...Default.args,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const deleteButton = canvas.getByRole("button", { name: "Delete" });
    deleteButton.click();
  },
};
