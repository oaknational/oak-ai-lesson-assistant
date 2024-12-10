import type { Meta, StoryObj } from "@storybook/react";

import type { ChatContextProps } from "@/components/ContextProviders/ChatProvider";
import { ChatContext } from "@/components/ContextProviders/ChatProvider";
import { DemoDecorator } from "@/storybook/decorators/DemoDecorator";

import ExportButtons from "./";

const ChatDecorator: Story["decorators"] = (Story, { parameters }) => (
  <ChatContext.Provider
    value={
      {
        id: "123",
        isStreaming: false,
        lessonPlan: {},
        ...parameters.chatContext,
      } as unknown as ChatContextProps
    }
  >
    <Story />
  </ChatContext.Provider>
);

const meta: Meta<typeof ExportButtons> = {
  title: "Components/LessonPlan/ExportButtons",
  component: ExportButtons,
  tags: ["autodocs"],
  decorators: [ChatDecorator, DemoDecorator],
  args: {
    sectionRefs: {},
    documentContainerRef: { current: null },
  },
};

export default meta;
type Story = StoryObj<typeof ExportButtons>;

export const Default: Story = {};

export const IsStreaming: Story = {
  parameters: {
    chatContext: {
      isStreaming: true,
    },
  },
};

export const SharingDisabled: Story = {
  parameters: {
    demoContext: {
      isDemoUser: true,
      isSharingEnabled: false,
    },
  },
};
