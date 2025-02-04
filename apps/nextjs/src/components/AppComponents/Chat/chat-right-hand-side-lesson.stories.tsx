import type { Message } from "@oakai/aila/src/core/chat";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import { chromaticParams } from "@/storybook/chromatic";
import { ChatDecorator } from "@/storybook/decorators/ChatDecorator";
import { ChatStoreDecorator } from "@/storybook/decorators/ChatStoreDecorator";
import {
  DemoDecorator,
  demoParams,
} from "@/storybook/decorators/DemoDecorator";
import { StoreDecorator } from "@/storybook/decorators/StoreDecorator";

import ChatRightHandSideLesson from "./chat-right-hand-side-lesson";

const DummyUserMessage: Message = {
  id: "123",
  role: "user",
  content: "Dummy message",
};

const DummyAssistantMessage: Message = {
  id: "123",
  role: "assistant",
  content: "Dummy message",
};

const DummyMessages: Message[] = [DummyUserMessage, DummyAssistantMessage];

const meta = {
  title: "Components/LessonPlan/ChatRightHandSideLesson",
  component: ChatRightHandSideLesson,
  tags: ["autodocs"],
  decorators: [ChatDecorator, DemoDecorator, StoreDecorator],
  args: {
    showLessonMobile: true,
    closeMobileLessonPullOut: fn,
    demo: { isDemoUser: false, isSharingEnabled: true, demo: undefined },
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile",
    },
    ...chromaticParams(["mobile"]),
    chatContext: {
      lessonPlan: {
        subject: "biology",
        keyStage: "key-stage-3",
        title: "About Frogs",
      },
      messages: DummyMessages,
    },
    ...demoParams({ isDemoUser: false }),
  },
} satisfies Meta<typeof ChatRightHandSideLesson>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const OnlyOneMessage: Story = {
  parameters: {
    chatContext: {
      messages: [DummyUserMessage],
    },
  },
};
