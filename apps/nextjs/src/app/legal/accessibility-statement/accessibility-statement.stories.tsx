import type { Meta, StoryObj } from "@storybook/nextjs";

import { chromaticParams } from "@/storybook/chromatic";

import { AccessibilityStatementContent } from "./accessibility-statement";
import { accessibilityStatementFixture } from "./accessibility-statement.story.fixture";

const meta = {
  title: "Pages/Legal/Accessibility Statement",
  component: AccessibilityStatementContent,
  parameters: {
    ...chromaticParams(["mobile", "desktop"]),
  },
} satisfies Meta<typeof AccessibilityStatementContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: accessibilityStatementFixture,
};
