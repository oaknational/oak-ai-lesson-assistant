import type { Meta, StoryObj } from "@storybook/react";

import { chromaticParams } from "@/storybook/chromatic";

import { HomePageContent } from "./home-page";

const meta: Meta<typeof HomePageContent> = {
  title: "Pages/Homepage",
  component: HomePageContent,
  parameters: {
    ...chromaticParams(["mobile", "desktop"]),
  },
};

export default meta;
type Story = StoryObj<typeof HomePageContent>;

export const Default: Story = {
  args: {
    // NOTE: We're not including mux video links right now
    pageData: null,
  },
};
