import type { Meta, StoryObj } from "@storybook/react";

import {
  ChatContext,
  type ChatContextProps,
} from "@/components/ContextProviders/ChatProvider";

import ChatLhsHeader from "./chat-lhs-header";

const ChatDecorator: Story["decorators"] = (Story, { parameters }) => (
  <ChatContext.Provider
    value={
      {
        ailaStreamingStatus: "Idle",
        ...parameters.chatContext,
      } as unknown as ChatContextProps
    }
  >
    <Story />
  </ChatContext.Provider>
);

const meta: Meta<typeof ChatLhsHeader> = {
  title: "Components/Chat/ChatLhsHeader",
  component: ChatLhsHeader,
  tags: ["autodocs"],
  decorators: [ChatDecorator],
  args: {
    showStreamingStatus: false,
  },
};

export default meta;
type Story = StoryObj<typeof ChatLhsHeader>;

export const Default: Story = {
  args: {},
};

export const NonProdStreamingStatus: Story = {
  args: {
    showStreamingStatus: true,
  },
  parameters: {
    chatContext: {
      ailaStreamingStatus: "StreamingLessonPlan",
    },
  },
};

export const DemoBannerPadding: Story = {
  args: {
    isDemoUser: true,
  },
};
