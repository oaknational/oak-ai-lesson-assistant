import type { Meta, StoryObj } from "@storybook/react";

import { chromaticParams } from "@/storybook/chromatic";
import { ChatDecorator } from "@/storybook/decorators/ChatDecorator";
import {
  DemoDecorator,
  demoParams,
} from "@/storybook/decorators/DemoDecorator";

import { MobileExportButtons } from "./MobileExportButtons";

const meta = {
  title: "Components/LessonPlan/MobileExportButtons",
  component: MobileExportButtons,
  tags: ["autodocs"],
  decorators: [ChatDecorator, DemoDecorator],
  parameters: {
    viewport: {
      defaultViewport: "mobile",
    },
    ...chromaticParams(["mobile"]),
    ...demoParams({ isDemoUser: false }),
    lessonPlanStoreState: {
      id: "123",
    },
  },
  args: {
    closeMobileLessonPullOut: () => {},
  },
} satisfies Meta<typeof MobileExportButtons>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SharingDisabled: Story = {
  parameters: {
    ...demoParams({ isDemoUser: true, isSharingEnabled: false }),
  },
};
