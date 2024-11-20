import type { Meta, StoryObj } from "@storybook/react";

import type { ChatContextProps } from "@/components/ContextProviders/ChatProvider";
import { ChatContext } from "@/components/ContextProviders/ChatProvider";
import { DemoProvider } from "@/components/ContextProviders/Demo";

import { MobileExportButtons } from "./MobileExportButtons";

const ChatDecorator: Story["decorators"] = (Story, { parameters }) => (
  <ChatContext.Provider
    value={
      {
        id: "123",
        ...parameters.chatContext,
      } as unknown as ChatContextProps
    }
  >
    <Story />
  </ChatContext.Provider>
);

const DemoDecorator: Story["decorators"] = (Story) => (
  <DemoProvider>
    <Story />
  </DemoProvider>
);

const meta: Meta<typeof MobileExportButtons> = {
  title: "Components/LessonPlan/MobileExportButtons",
  component: MobileExportButtons,
  tags: ["autodocs"],
  decorators: [ChatDecorator, DemoDecorator],
  args: {
    closeMobileLessonPullOut: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof MobileExportButtons>;

export const Default: Story = {};

// TODO
export const SharingDisabled: Story = {};
