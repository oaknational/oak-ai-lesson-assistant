import type { Meta, StoryObj } from "@storybook/react";

import type { ChatContextProps } from "@/components/ContextProviders/ChatProvider";
import { ChatContext } from "@/components/ContextProviders/ChatProvider";
import { DemoContext } from "@/components/ContextProviders/Demo";

import { chromaticParams } from "../../../../../.storybook/chromatic";
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

const DemoDecorator: Story["decorators"] = (Story, { parameters }) => (
  <DemoContext.Provider
    value={{
      isDemoUser: false,
      isSharingEnabled: true,
      ...parameters.demoContext,
    }}
  >
    <Story />
  </DemoContext.Provider>
);

const meta: Meta<typeof MobileExportButtons> = {
  title: "Components/LessonPlan/MobileExportButtons",
  component: MobileExportButtons,
  tags: ["autodocs"],
  decorators: [ChatDecorator, DemoDecorator],
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
    ...chromaticParams(["mobile"]),
  },
  args: {
    closeMobileLessonPullOut: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof MobileExportButtons>;

export const Default: Story = {};

export const SharingDisabled: Story = {
  parameters: {
    demoContext: {
      isDemoUser: true,
      isSharingEnabled: false,
    },
  },
};
