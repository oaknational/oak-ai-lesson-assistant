import type { Meta, StoryObj } from "@storybook/react";

import type { ChatContextProps } from "@/components/ContextProviders/ChatProvider";
import { chromaticParams } from "@/storybook/chromatic";
import { ChatDecorator } from "@/storybook/decorators/ChatDecorator";
import { ChatStoreDecorator } from "@/storybook/decorators/ChatStoreDecorator";
import { ModerationStoreDecorator } from "@/storybook/decorators/ModerationStoreDecorator";

import LessonPlanDisplay from "./chat-lessonPlanDisplay";

const chatContext: Partial<ChatContextProps> = {
  id: "123",
  messages: [],
  lessonPlan: {
    title: "About Frogs",
    keyStage: "Key Stage 2",
    subject: "Science",
    topic: "Amphibians",
    basedOn: { title: "Frogs in Modern Britain", id: "123" },
    learningOutcome:
      "To understand the importance of frogs in British society and culture",
  },
};

const meta = {
  title: "Components/LessonPlan/LessonPlanDisplay",
  component: LessonPlanDisplay,
  tags: ["autodocs"],
  decorators: [ChatDecorator, ChatStoreDecorator, ModerationStoreDecorator],
  args: {
    documentContainerRef: { current: null },
    chatEndRef: undefined,
    sectionRefs: {},
    showLessonMobile: false,
  },

  parameters: {
    ...chromaticParams(["desktop"]),
  },
} satisfies Meta<typeof LessonPlanDisplay>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  parameters: {
    chatContext,
    moderationStoreState: {
      lastModeration: null,
    },
  },
};
export const WithModeration: Story = {
  args: {},
  parameters: {
    chatStoreState: {
      ailaStreamingStatus: "Idle",
    },
    moderationStoreState: {
      lastModeration: {
        id: "123",
        categories: ["l/strong-language"],
      },
    },
    chatContext: {
      ...chatContext,
    },
  },
};

export const Loading: Story = {
  args: {},
  parameters: {
    chatStoreState: {
      ailaStreamingStatus: "Idle",
    },
    chatContext: {
      ...chatContext,
      lessonPlan: {},
    },
    moderationStoreState: {
      lastModeration: null,
    },
  },
};
