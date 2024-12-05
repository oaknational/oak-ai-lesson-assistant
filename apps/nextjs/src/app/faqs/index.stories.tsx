import type { Meta, StoryObj } from "@storybook/react";

import { FAQPageContent } from ".";
import { CHROMATIC_ALL_VIEWPORTS_COMPAT } from "../../../.storybook/chromatic";

const meta: Meta<typeof FAQPageContent> = {
  title: "Pages/FAQs",
  component: FAQPageContent,
  parameters: {
    ...CHROMATIC_ALL_VIEWPORTS_COMPAT,
  },
};

export default meta;
type Story = StoryObj<typeof FAQPageContent>;

export const Default: Story = {
  args: {},
};
