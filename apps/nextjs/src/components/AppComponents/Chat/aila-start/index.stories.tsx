import type { Meta, StoryObj } from "@storybook/nextjs";

import { chromaticParams } from "@/storybook/chromatic";
import { AnalyticsDecorator } from "@/storybook/decorators/AnalyticsDecorator";

import { AilaStart } from "./index";

const meta = {
  title: "Pages/aila/tools",
  component: AilaStart,
  decorators: [AnalyticsDecorator],
  parameters: {
    layout: "fullscreen",
    ...chromaticParams(["mobile", "desktop"]),
    auth: "signedIn",
  },
} satisfies Meta<typeof AilaStart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SignedOut: Story = {
  parameters: {
    auth: "signedOut",
  },
};
