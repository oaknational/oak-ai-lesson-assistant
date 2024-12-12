import type { Meta, StoryObj } from "@storybook/react";

import { ChatDecorator } from "@/storybook/decorators/ChatDecorator";

import ChatLhsHeader from "./chat-lhs-header";

const meta: Meta<typeof ChatLhsHeader> = {
  title: "Components/Chat/ChatLhsHeader",
  component: ChatLhsHeader,
  tags: ["autodocs"],
  decorators: [ChatDecorator],
  args: {
    showStreamingStatus: false,
  },
  parameters: {
    chatContext: {
      ailaStreamingStatus: "Idle",
    },
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
