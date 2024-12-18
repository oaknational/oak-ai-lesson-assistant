import type { Meta, StoryObj } from "@storybook/react";

import { DemoProvider } from "@/components/ContextProviders/Demo";
import { chromaticParams } from "@/storybook/chromatic";

import { HelpContent } from ".";

const meta = {
  title: "Pages/Chat/Help",
  component: HelpContent,
  parameters: {
    // Including custom decorators changes the layout from fullscreen
    layout: "fullscreen",
    ...chromaticParams(["mobile", "desktop"]),
  },
  decorators: [
    (Story) => (
      <DemoProvider>
        <Story />
      </DemoProvider>
    ),
  ],
} satisfies Meta<typeof HelpContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
