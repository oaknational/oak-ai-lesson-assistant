import type { Meta, StoryObj } from "@storybook/react";

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
  updatedAt: new Date(),
};

export const Default: Story = {
  args: {
    chat: mockChat,
  },
};

export const RemovePending: Story = {
  args: {
    ...Default.args,
  },
  play: async ({ canvasElement }) => {
    const deleteButton = canvasElement.querySelector("button:nth-child(2)");
    if (deleteButton instanceof HTMLElement) {
      deleteButton.click();
    }
  },
};
