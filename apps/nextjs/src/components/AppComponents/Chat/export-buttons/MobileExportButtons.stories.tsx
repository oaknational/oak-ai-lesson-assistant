import type { Meta, StoryObj } from "@storybook/react";

import { chromaticParams } from "@/storybook/chromatic";
import { ChatDecorator } from "@/storybook/decorators/ChatDecorator";
import { DemoDecorator } from "@/storybook/decorators/DemoDecorator";

import { MobileExportButtons } from "./MobileExportButtons";

const meta: Meta<typeof MobileExportButtons> = {
  title: "Components/LessonPlan/MobileExportButtons",
  component: MobileExportButtons,
  tags: ["autodocs"],
  decorators: [ChatDecorator, DemoDecorator],
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
    ...chromaticParams(["mobile"]),
    chatContext: {
      id: "123",
    },
  },
  args: {
    closeMobileLessonPullOut: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof MobileExportButtons>;

export const Default: Story = {};

export const SharingDisabled: Story = {
  parameters: {
    demoContext: {
      isDemoUser: true,
      isSharingEnabled: false,
    },
  },
};
