import type { Meta, StoryObj } from "@storybook/react";
import { within } from "@storybook/test";

import { chromaticParams } from "@/storybook/chromatic";

import { SidebarActions } from "./sidebar-actions";

const meta = {
  title: "Components/Sidebar/Actions",
  component: SidebarActions,
  parameters: {
    layout: "centered",
    ...chromaticParams(["desktop"]),
  },
  tags: ["autodocs"],
} satisfies Meta<typeof SidebarActions>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockChat = {
  id: "1",
  title: "Mock chat title",
  isShared: false,
  updatedAt: new Date(),
};

export const Default: Story = {
  args: {
    chat: mockChat,
  },
};

// NOTE: The modal appears on a parent element which isn't captured by visual testing
// TODO: Test the modal directly
export const SharePending: Story = {
  args: {
    ...Default.args,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const deleteButton = canvas.getByRole("button", { name: "Share" });
    deleteButton.click();
    return Promise.resolve();
  },
};

// NOTE: The modal appears on a parent element which isn't captured by visual testing
// TODO: Test the modal directly
export const RemovePending: Story = {
  args: {
    ...Default.args,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const deleteButton = canvas.getByRole("button", { name: "Delete" });
    deleteButton.click();
    return Promise.resolve();
  },
};
