import type { Meta, StoryObj } from "@storybook/react";

import {
  ChatContext,
  type ChatContextProps,
} from "@/components/ContextProviders/ChatProvider";
import { lessonPlanTrackingContext } from "@/lib/analytics/lessonPlanTrackingContext";
import { SidebarContext } from "@/lib/hooks/use-sidebar";

import { ChatPanel } from "./chat-panel";

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

const LessonPlanTrackingContextDecorator: Story["decorators"] = (Story) => (
  <lessonPlanTrackingContext.Provider
    value={{
      onClickContinue: () => {},
      onClickRetry: () => {},
      onClickStartFromExample: () => {},
      onClickStartFromFreeText: () => {},
      onStreamFinished: () => {},
      onSubmitText: () => {},
    }}
  >
    <Story />
  </lessonPlanTrackingContext.Provider>
);

const SidebarContextDecorator: Story["decorators"] = (Story) => (
  <SidebarContext.Provider
    value={{
      toggleSidebar: () => {},
      isLoading: false,
      isSidebarOpen: false,
    }}
  >
    <Story />
  </SidebarContext.Provider>
);

const meta: Meta<typeof ChatPanel> = {
  title: "Components/Chat/ChatPanel",
  component: ChatPanel,
  tags: ["autodocs"],
  decorators: [
    ChatDecorator,
    LessonPlanTrackingContextDecorator,
    SidebarContextDecorator,
  ],
  args: {
    isDemoLocked: false,
  },
};

export default meta;
type Story = StoryObj<typeof ChatPanel>;

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
    chatContext: {
      ailaStreamingStatus: "Idle",
    },
  },
};

export const IdleWithQueuedUserAction: Story = {
  args: {},
  parameters: {
    chatContext: {
      queuedUserAction: "regenerate",
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

export const StreamingWithQueuedUserAction: Story = {
  args: {},
  parameters: {
    chatContext: {
      queuedUserAction: "regenerate",
      ailaStreamingStatus: "StreamingLessonPlan",
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

export const ModeratingWithRegenerateUserAction: Story = {
  args: {},
  parameters: {
    chatContext: {
      queuedUserAction: "regenerate",
      ailaStreamingStatus: "Moderating",
    },
  },
};

export const CustomQueuedUserAction: Story = {
  args: {},
  parameters: {
    chatContext: {
      queuedUserAction: "Increase the reading age of that section",
      ailaStreamingStatus: "Moderating",
    },
  },
};
