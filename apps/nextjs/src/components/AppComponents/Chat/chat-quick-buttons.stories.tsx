import type { Message } from "@oakai/aila/src/core/chat";
import type { Meta, StoryObj } from "@storybook/react";

import { ChatDecorator } from "@/storybook/decorators/ChatDecorator";
import { LessonPlanTrackingDecorator } from "@/storybook/decorators/LessonPlanTrackingDecorator";

import ChatQuickButtons from "./chat-quick-buttons";

const DummyMessage: Message = {
  content: "Dummy message",
  id: "123",
  role: "user",
};

const meta = {
  title: "Components/Chat/ChatQuickButtons",
  component: ChatQuickButtons,
  tags: ["autodocs"],
  decorators: [ChatDecorator, LessonPlanTrackingDecorator],
  parameters: {
    chatContext: {
      messages: [DummyMessage],
    },
  },
} satisfies Meta<typeof ChatQuickButtons>;

export default meta;
type Story = StoryObj<typeof meta>;

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
