import type { Meta, StoryObj } from "@storybook/react";

import type { ParsedMessage } from "@/stores/chatStore/types";
import { chromaticParams } from "@/storybook/chromatic";
import { StoreDecorator } from "@/storybook/decorators/StoreDecorator";

import ChatQuickButtons from "./chat-quick-buttons";

const DummyMessage: ParsedMessage = {
  content: "Dummy message",
  id: "123",
  role: "user",
  parts: [],
  isEditing: false,
  hasError: false,
};

const meta = {
  title: "Components/Chat/ChatQuickButtons",
  component: ChatQuickButtons,
  tags: ["autodocs"],
  decorators: [StoreDecorator],
  parameters: {
    ...chromaticParams(["desktop"]),
    chatStoreState: {
      stableMessages: [DummyMessage],
    },
  },
} satisfies Meta<typeof ChatQuickButtons>;

export default meta;
type Story = StoryObj<typeof meta>;

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

export const LoadingWithoutMessages: Story = {
  args: {},
  parameters: {
    chatStoreState: {
      ailaStreamingStatus: "Loading",
      stableMessages: [],
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

export const StreamingWithQueuedUserAction: Story = {
  args: {},
  parameters: {
    chatStoreState: {
      queuedUserAction: { type: "regenerate" },
      ailaStreamingStatus: "StreamingLessonPlan",
    },
  },
};

export const ModeratingWithQueuedUserAction: Story = {
  args: {},
  parameters: {
    chatStoreState: {
      queuedUserAction: { type: "regenerate" },
      ailaStreamingStatus: "Moderating",
    },
  },
};
