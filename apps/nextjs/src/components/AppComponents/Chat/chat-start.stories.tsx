import type { Meta, StoryObj } from "@storybook/react";

import { DemoProvider } from "@/components/ContextProviders/Demo";

import { chromaticParams } from "../../../../.storybook/chromatic";
import { DialogProvider } from "../DialogContext";
import { ChatStart } from "./chat-start";

const meta: Meta<typeof ChatStart> = {
  title: "Pages/Chat/Chat Start",
  component: ChatStart,
  parameters: {
    // Including custom decorators changes the layout from fullscreen
    layout: "fullscreen",
    ...chromaticParams(["mobile", "desktop"]),
  },
  decorators: [
    (Story) => (
      <DialogProvider>
        <DemoProvider>
          <Story />
        </DemoProvider>
      </DialogProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ChatStart>;

export const Default: Story = {
  args: {},
};
