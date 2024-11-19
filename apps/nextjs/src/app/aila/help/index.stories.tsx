import type { Meta, StoryObj } from "@storybook/react";

import { DemoProvider } from "@/components/ContextProviders/Demo";

import { HelpContent } from ".";

const meta: Meta<typeof HelpContent> = {
  title: "Pages/Chat/Help",
  component: HelpContent,
  parameters: {
    // Including custom decorators changes the layout from fullscreen
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <DemoProvider>
        <Story />
      </DemoProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof HelpContent>;

export const Default: Story = {
  args: {},
};
