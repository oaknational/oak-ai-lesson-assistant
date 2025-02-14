import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import { chromaticParams } from "@/storybook/chromatic";
import { StoreDecorator } from "@/storybook/decorators/StoreDecorator";

import ChatLhsHeader from "./chat-lhs-header";

const meta = {
  title: "Components/Chat/ChatLhsHeader",
  component: ChatLhsHeader,
  tags: ["autodocs"],
  decorators: [StoreDecorator],
  args: {
    showStreamingStatus: false,
    setShowLessonMobile: fn(),
    showLessonMobile: false,
    isDemoUser: false,
  },
  parameters: {
    ...chromaticParams(["desktop"]),
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
