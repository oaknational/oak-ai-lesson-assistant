import type { Meta, StoryObj } from "@storybook/react";

import { chromaticParams } from "@/storybook/chromatic";

import { FAQPageContent } from ".";

const meta = {
  title: "Pages/FAQs",
  component: FAQPageContent,
  parameters: {
    ...chromaticParams(["mobile", "desktop"]),
  },
} satisfies Meta<typeof FAQPageContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
