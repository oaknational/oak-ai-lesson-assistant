import type { Meta, StoryObj } from "@storybook/react";

import { chromaticParams } from "@/storybook/chromatic";

import TermsContent from "./TermsContent";

const meta = {
  title: "Components/Onboarding/TermsContent",
  component: TermsContent,
  parameters: {
    ...chromaticParams(["desktop"]),
  },
} satisfies Meta<typeof TermsContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
