import type { Meta, StoryObj } from "@storybook/react";

import type { ParsedMessage } from "@/stores/chatStore/types";
import { chromaticParams } from "@/storybook/chromatic";
import { SidebarDecorator } from "@/storybook/decorators/SidebarDecorator";
import { StoreDecorator } from "@/storybook/decorators/StoreDecorator";

import { ChatPanel } from "./chat-panel";

const DummyMessage: ParsedMessage = {
  content: "Dummy message",
  id: "123",
  role: "user",
  parts: [],
  hasError: false,
  isEditing: false,
};

const meta = {
  title: "Components/Chat/ChatPanel",
  component: ChatPanel,
  tags: ["autodocs"],
  decorators: [SidebarDecorator, StoreDecorator],
  args: {
    isDemoLocked: false,
  },
  parameters: {
    ...chromaticParams(["desktop"]),
    chatStoreState: {
      stableMessages: [DummyMessage],
    },
  },
} satisfies Meta<typeof ChatPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const NoMessages: Story = {
  args: {},
  parameters: {
    chatStoreState: {
      stableMessages: [],
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
