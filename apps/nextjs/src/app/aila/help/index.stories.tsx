import type { Meta, StoryObj } from "@storybook/react";

import { DemoProvider } from "@/components/ContextProviders/Demo";

import Help from "./index";

const meta: Meta<typeof Help> = {
  title: "Pages/Chat/Help",
  component: Help,
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
type Story = StoryObj<typeof Help>;

export const Default: Story = {
  args: {},
};
