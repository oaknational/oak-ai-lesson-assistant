import type { Meta, StoryObj } from "@storybook/react";

import { chromaticParams } from "@/storybook/chromatic";
import { DialogContentDecorator } from "@/storybook/decorators/DialogContentDecorator";

import { ModerationMessage } from "./TeachingMaterialMessage";

const meta = {
  title: "Components/TeachingMaterials/TeachingMaterialMessage",
  component: ModerationMessage,
  decorators: [DialogContentDecorator],
  parameters: {
    ...chromaticParams(["desktop"]),
    layout: "centered",
  },
} satisfies Meta<typeof ModerationMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
