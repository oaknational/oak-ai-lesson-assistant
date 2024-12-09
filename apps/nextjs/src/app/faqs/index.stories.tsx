import type { Meta, StoryObj } from "@storybook/react";

import { FAQPageContent } from ".";
import { chromaticParams } from "../../../.storybook/chromatic";

const meta: Meta<typeof FAQPageContent> = {
  title: "Pages/FAQs",
  component: FAQPageContent,
  parameters: {
    ...chromaticParams(["mobile", "legacy"]),
  },
};

export default meta;
type Story = StoryObj<typeof FAQPageContent>;

export const Default: Story = {
  args: {},
};
