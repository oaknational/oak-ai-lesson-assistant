import type { Meta, StoryObj } from "@storybook/react";

import { ChatDecorator } from "@/storybook/decorators/ChatDecorator";
import { DemoDecorator } from "@/storybook/decorators/DemoDecorator";

import ExportButtons from "./";

const meta: Meta<typeof ExportButtons> = {
  title: "Components/LessonPlan/ExportButtons",
  component: ExportButtons,
  tags: ["autodocs"],
  decorators: [ChatDecorator, DemoDecorator],
  args: {
    sectionRefs: {},
    documentContainerRef: { current: null },
  },
  parameters: {
    chatContext: {
      id: "123",
      isStreaming: false,
      lessonPlan: {},
    },
  },
};

export default meta;
type Story = StoryObj<typeof ExportButtons>;

export const Default: Story = {};

export const IsStreaming: Story = {
  parameters: {
    chatContext: {
      isStreaming: true,
    },
  },
};

export const SharingDisabled: Story = {
  parameters: {
    demoContext: {
      isDemoUser: true,
      isSharingEnabled: false,
    },
  },
};
