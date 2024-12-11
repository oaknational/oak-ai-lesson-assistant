import type { Meta, StoryObj } from "@storybook/react";

import type { ChatContextProps } from "@/components/ContextProviders/ChatProvider";
import { ChatContext } from "@/components/ContextProviders/ChatProvider";

import LessonPlanDisplay from "./chat-lessonPlanDisplay";

const ChatDecorator: Story["decorators"] = (Story, { parameters }) => (
  <ChatContext.Provider
    value={
      {
        id: "123",
        lastModeration: null,
        messages: [],
        lessonPlan: {
          title: "About Frogs",
          keyStage: "Key Stage 2",
          subject: "Science",
          topic: "Amphibians",
          basedOn: "Frogs in Modern Britain",
          learningOutcome:
            "To understand the importance of frogs in British society and culture",
        },
        ailaStreamingStatus: "Idle",
        ...parameters.chatContext,
      } as unknown as ChatContextProps
    }
  >
    <Story />
  </ChatContext.Provider>
);

const meta: Meta<typeof LessonPlanDisplay> = {
  title: "Components/LessonPlan/LessonPlanDisplay",
  component: LessonPlanDisplay,
  tags: ["autodocs"],
  decorators: [ChatDecorator],
  args: {},
};

export default meta;

type Story = StoryObj<typeof LessonPlanDisplay>;

export const Default: Story = {
  args: {},
  parameters: {
    chatContext: {},
  },
};

export const Loading: Story = {
  args: {},
  parameters: {
    chatContext: {
      lessonPlan: {},
    },
  },
};

export const WithModeration: Story = {
  args: {},
  parameters: {
    chatContext: {
      lastModeration: {
        categories: ["l/strong-language"],
      },
    },
  },
};
