import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import { chromaticParams } from "@/storybook/chromatic";
import {
  DemoDecorator,
  demoParams,
} from "@/storybook/decorators/DemoDecorator";
import { StoreDecorator } from "@/storybook/decorators/StoreDecorator";

import ChatLhsHeader from "./chat-lhs-header";

const meta = {
  title: "Components/Chat/ChatLhsHeader",
  component: ChatLhsHeader,
  tags: ["autodocs"],
  decorators: [DemoDecorator, StoreDecorator],
  args: {
    showStreamingStatus: false,
    setShowLessonMobile: fn(),
    showLessonMobile: false,
  },
  parameters: {
    ...chromaticParams(["desktop"]),
    ...demoParams({ isDemoUser: false }),
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
  parameters: {
    ...demoParams({ isDemoUser: true }),
  },
};
