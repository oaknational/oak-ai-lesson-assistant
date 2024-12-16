import type { Meta, StoryObj } from "@storybook/react";

import { chromaticParams } from "@/storybook/chromatic";

import { FAQPageContent } from ".";

const meta: Meta<typeof FAQPageContent> = {
  title: "Pages/FAQs",
  component: FAQPageContent,
  parameters: {
    ...chromaticParams(["mobile", "desktop"]),
  },
};

export default meta;
type Story = StoryObj<typeof FAQPageContent>;

export const Default: Story = {
  args: {},
};
