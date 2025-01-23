import type { Meta, StoryObj } from "@storybook/react";

import { chromaticParams } from "@/storybook/chromatic";
import { ChatDecorator } from "@/storybook/decorators/ChatDecorator";
import { ChatStoreDecorator } from "@/storybook/decorators/ChatStoreDecorator";
import {
  DemoDecorator,
  demoParams,
} from "@/storybook/decorators/DemoDecorator";

import ExportButtons from "./";

const meta = {
  title: "Components/LessonPlan/ExportButtons",
  component: ExportButtons,
  tags: ["autodocs"],
  decorators: [ChatDecorator, DemoDecorator, ChatStoreDecorator],
  args: {
    sectionRefs: {},
    documentContainerRef: { current: null },
  },
  parameters: {
    ...chromaticParams(["desktop"]),
    chatStoreState: {
      isStreaming: false,
    },
    chatContext: {
      id: "123",
      lessonPlan: {},
    },
    ...demoParams({ isDemoUser: false }),
  },
} satisfies Meta<typeof ExportButtons>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const IsStreaming: Story = {
  parameters: {
    chatStoreState: {
      isStreaming: false,
    },
  },
};

export const SharingDisabled: Story = {
  parameters: {
    ...demoParams({ isDemoUser: true, isSharingEnabled: false }),
  },
};
