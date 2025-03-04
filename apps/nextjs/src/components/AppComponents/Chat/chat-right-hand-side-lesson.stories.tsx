import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import type { ParsedMessage } from "@/stores/chatStore/types";
import { chromaticParams } from "@/storybook/chromatic";
import {
  DemoDecorator,
  demoParams,
} from "@/storybook/decorators/DemoDecorator";
import { StoreDecorator } from "@/storybook/decorators/StoreDecorator";

import ChatRightHandSideLesson from "./chat-right-hand-side-lesson";

const DummyUserMessage: ParsedMessage = {
  id: "123",
  role: "user",
  content: "Dummy message",
  parts: [],
  hasError: false,
  isEditing: false,
};

const DummyAssistantMessage: ParsedMessage = {
  id: "123",
  role: "assistant",
  content: "Dummy message",
  parts: [],
  hasError: false,
  isEditing: false,
};

const DummyParsedMessages: ParsedMessage[] = [
  DummyUserMessage,
  DummyAssistantMessage,
];

const meta = {
  title: "Components/LessonPlan/ChatRightHandSideLesson",
  component: ChatRightHandSideLesson,
  tags: ["autodocs"],
  decorators: [DemoDecorator, StoreDecorator],
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
    chatStoreState: {
      stableMessages: DummyParsedMessages,
    },
    lessonPlanStoreState: {
      lessonPlan: {
        subject: "biology",
        keyStage: "key-stage-3",
        title: "About Frogs",
      },
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
    chatStoreState: {
      stableMessages: [DummyUserMessage],
    },
  },
};
