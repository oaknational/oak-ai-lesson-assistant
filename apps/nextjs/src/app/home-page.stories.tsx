import type { Meta, StoryObj } from "@storybook/react";

import { HomePageContent } from "./home-page";

const meta: Meta<typeof HomePageContent> = {
  title: "Pages/Homepage",
  component: HomePageContent,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof HomePageContent>;

export const Default: Story = {
  args: {
    // NOTE: We're not including mux video links right now
    pageData: null,
  },
};
