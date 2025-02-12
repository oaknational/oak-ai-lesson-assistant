import type { Meta, StoryObj } from "@storybook/react";

import { chromaticParams } from "@/storybook/chromatic";
import { ChatDecorator } from "@/storybook/decorators/ChatDecorator";
import {
  DemoDecorator,
  demoParams,
} from "@/storybook/decorators/DemoDecorator";
import { StoreDecorator } from "@/storybook/decorators/StoreDecorator";

import ExportButtons from "./";

const meta = {
  title: "Components/LessonPlan/ExportButtons",
  component: ExportButtons,
  tags: ["autodocs"],
  decorators: [ChatDecorator, DemoDecorator, StoreDecorator],
  args: {
    sectionRefs: {},
    documentContainerRef: { current: null },
  },
  parameters: {
    ...chromaticParams(["desktop"]),
    chatContext: {
      lessonPlan: {},
    },
    chatStoreState: {
      ailaStreamingStatus: "Idle",
    },
    lessonPlanStoreState: {
      id: "123",
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
      ailaStreamingStatus: "StreamingChatResponse",
    },
  },
};

export const SharingDisabled: Story = {
  parameters: {
    ...demoParams({ isDemoUser: true, isSharingEnabled: false }),
  },
};
