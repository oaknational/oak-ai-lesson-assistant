import type { Message } from "@oakai/aila/src/core/chat";
import type { Meta, StoryObj } from "@storybook/react";

import { chromaticParams } from "@/storybook/chromatic";
import { ChatDecorator } from "@/storybook/decorators/ChatDecorator";
import { LessonPlanTrackingDecorator } from "@/storybook/decorators/LessonPlanTrackingDecorator";
import { SidebarDecorator } from "@/storybook/decorators/SidebarDecorator";
import { StoreDecorator } from "@/storybook/decorators/StoreDecorator";

import { ChatPanel } from "./chat-panel";

const DummyMessage: Message = {
  content: "Dummy message",
  id: "123",
  role: "user",
};

const meta = {
  title: "Components/Chat/ChatPanel",
  component: ChatPanel,
  tags: ["autodocs"],
  decorators: [
    ChatDecorator,
    LessonPlanTrackingDecorator,
    SidebarDecorator,
    StoreDecorator,
  ],
  args: {
    isDemoLocked: false,
  },
  parameters: {
    ...chromaticParams(["desktop"]),
    chatContext: {
      messages: [DummyMessage],
    },
  },
} satisfies Meta<typeof ChatPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const NoMessages: Story = {
  args: {},
  parameters: {
    chatContext: {
      messages: [],
    },
  },
};

export const DemoLocked: Story = {
  args: {
    isDemoLocked: true,
  },
};

export const Idle: Story = {
  args: {},
  parameters: {
    chatStoreState: {
      ailaStreamingStatus: "Idle",
    },
  },
};

export const Loading: Story = {
  args: {},
  parameters: {
    chatStoreState: {
      ailaStreamingStatus: "Loading",
    },
  },
};

export const RequestMade: Story = {
  args: {},
  parameters: {
    chatStoreState: {
      ailaStreamingStatus: "RequestMade",
    },
  },
};

export const StreamingLessonPlan: Story = {
  args: {},
  parameters: {
    chatStoreState: {
      ailaStreamingStatus: "StreamingLessonPlan",
    },
  },
};

export const StreamingChatResponse: Story = {
  args: {},
  parameters: {
    chatStoreState: {
      ailaStreamingStatus: "StreamingChatResponse",
    },
  },
};
export const Moderating: Story = {
  args: {},
  parameters: {
    chatStoreState: {
      ailaStreamingStatus: "Moderating",
    },
  },
};

export const ModeratingWithRegenerateUserAction: Story = {
  args: {},
  parameters: {
    chatStoreState: {
      queuedUserAction: "regenerate",
      ailaStreamingStatus: "Moderating",
    },
  },
};

export const CustomQueuedUserAction: Story = {
  args: {},
  parameters: {
    chatStoreState: {
      queuedUserAction: "Increase the reading age of that section",
      ailaStreamingStatus: "Moderating",
    },
  },
};
