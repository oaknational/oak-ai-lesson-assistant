import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import { chromaticParams } from "@/storybook/chromatic";
import { ChatDecorator } from "@/storybook/decorators/ChatDecorator";
import { ChatStoreDecorator } from "@/storybook/decorators/ChatStoreDecorator";

import ChatLhsHeader from "./chat-lhs-header";

const meta = {
  title: "Components/Chat/ChatLhsHeader",
  component: ChatLhsHeader,
  tags: ["autodocs"],
  decorators: [ChatDecorator, ChatStoreDecorator],
  args: {
    showStreamingStatus: false,
    setShowLessonMobile: fn(),
    showLessonMobile: false,
    isDemoUser: false,
  },
  parameters: {
    ...chromaticParams(["desktop"]),
    chatContext: {
      // ailaStreamingStatus: "Idle",
    },
  },
} satisfies Meta<typeof ChatLhsHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NonProdStreamingStatus: Story = {
  args: {
    showStreamingStatus: true,
  },
  parameters: {
    chatStoreState: {
      ailaStreamingStatus: "StreamingLessonPlan",
    },
  },
};

export const DemoBannerPadding: Story = {
  args: {
    isDemoUser: true,
  },
};
