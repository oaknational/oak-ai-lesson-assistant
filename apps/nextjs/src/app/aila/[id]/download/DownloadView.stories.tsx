import type { Meta, StoryObj } from "@storybook/react";

import { DownloadView } from "./DownloadView";

const meta: Meta<typeof DownloadView> = {
  title: "Pages/Chat/Download",
  component: DownloadView,
};

export default meta;
type Story = StoryObj<typeof DownloadView>;

export const Default: Story = {
  args: {},
};
