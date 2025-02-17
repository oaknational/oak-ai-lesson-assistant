import type { LooseLessonPlan } from "@oakai/aila/src/protocol/schema";
import type { Meta, StoryObj } from "@storybook/react";

import type { ChatContextProps } from "@/components/ContextProviders/ChatProvider";
import { chromaticParams } from "@/storybook/chromatic";
import { ChatDecorator } from "@/storybook/decorators/ChatDecorator";
import { StoreDecorator } from "@/storybook/decorators/StoreDecorator";

import LessonPlanDisplay from "./chat-lessonPlanDisplay";

const lessonPlan = {
  title: "About Frogs",
  keyStage: "Key Stage 2",
  subject: "Science",
  topic: "Amphibians",
  basedOn: { title: "Frogs in Modern Britain", id: "123" },
  learningOutcome:
    "To understand the importance of frogs in British society and culture",
} satisfies LooseLessonPlan;

const chatContext: Partial<ChatContextProps> = {
  messages: [],
};

const meta = {
  title: "Components/LessonPlan/LessonPlanDisplay",
  component: LessonPlanDisplay,
  tags: ["autodocs"],
  decorators: [ChatDecorator, StoreDecorator],
  args: {
    documentContainerRef: { current: null },
    chatEndRef: undefined,
    showLessonMobile: false,
  },

  parameters: {
    ...chromaticParams(["desktop"]),
    lessonPlanStoreState: {
      id: "123",
    },
  },
} satisfies Meta<typeof LessonPlanDisplay>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  parameters: {
    chatStoreState: {
      ailaStreamingStatus: "Idle",
    },
    chatContext: {
      ...chatContext,
    },
    moderationStoreState: {
      lastModeration: null,
    },
    lessonPlanStoreState: {
      lessonPlan,
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
    lessonPlanStoreState: {
      lessonPlan,
    },
  },
};

export const Loading: Story = {
  args: {},
  parameters: {
    chatStoreState: {
      ailaStreamingStatus: "Loading",
    },
    chatContext: {
      ...chatContext,
    },

    moderationStoreState: {
      lastModeration: null,
    },
    lessonPlanStoreState: {
      lessonPlan: {},
    },
  },
};
