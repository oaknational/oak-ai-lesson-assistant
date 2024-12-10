import type { Meta, StoryObj } from "@storybook/react";

import {
  ChatContext,
  type ChatContextProps,
} from "@/components/ContextProviders/ChatProvider";
import { LessonPlanTrackingDecorator } from "@/storybook/decorators/LessonPlanTrackingDecorator";

import ChatQuickButtons from "./chat-quick-buttons";

const DummyMessage = {};

const ChatDecorator: Story["decorators"] = (Story, { parameters }) => (
  <ChatContext.Provider
    value={
      {
        messages: [DummyMessage],
        ...parameters.chatContext,
      } as unknown as ChatContextProps
    }
  >
    <Story />
  </ChatContext.Provider>
);

const meta: Meta<typeof ChatQuickButtons> = {
  title: "Components/Chat/ChatQuickButtons",
  component: ChatQuickButtons,
  tags: ["autodocs"],
  decorators: [ChatDecorator, LessonPlanTrackingDecorator],
};

export default meta;
type Story = StoryObj<typeof ChatQuickButtons>;

export const Idle: Story = {
  args: {},
  parameters: {
    chatContext: {
      ailaStreamingStatus: "Idle",
    },
  },
};

export const Loading: Story = {
  args: {},
  parameters: {
    chatContext: {
      ailaStreamingStatus: "Loading",
    },
  },
};

export const LoadingWithoutMessages: Story = {
  args: {},
  parameters: {
    chatContext: {
      ailaStreamingStatus: "Loading",
      messages: [],
    },
  },
};

export const RequestMade: Story = {
  args: {},
  parameters: {
    chatContext: {
      ailaStreamingStatus: "RequestMade",
    },
  },
};

export const StreamingLessonPlan: Story = {
  args: {},
  parameters: {
    chatContext: {
      ailaStreamingStatus: "StreamingLessonPlan",
    },
  },
};

export const StreamingChatResponse: Story = {
  args: {},
  parameters: {
    chatContext: {
      ailaStreamingStatus: "StreamingChatResponse",
    },
  },
};

export const Moderating: Story = {
  args: {},
  parameters: {
    chatContext: {
      ailaStreamingStatus: "Moderating",
    },
  },
};

export const StreamingWithQueuedUserAction: Story = {
  args: {},
  parameters: {
    chatContext: {
      queuedUserAction: "regenerate",
      ailaStreamingStatus: "StreamingLessonPlan",
    },
  },
};

export const ModeratingWithQueuedUserAction: Story = {
  args: {},
  parameters: {
    chatContext: {
      queuedUserAction: "regenerate",
      ailaStreamingStatus: "Moderating",
    },
  },
};
