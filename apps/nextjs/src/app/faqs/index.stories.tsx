import type { Meta, StoryObj } from "@storybook/react";

import { FAQPageContent } from ".";

const meta: Meta<typeof FAQPageContent> = {
  title: "Pages/FAQs",
  component: FAQPageContent,
};

export default meta;
type Story = StoryObj<typeof FAQPageContent>;

export const Default: Story = {
  args: {},
};
