import type { Meta, StoryObj } from "@storybook/react";

import TermsContent from "./TermsContent";

const meta: Meta<typeof TermsContent> = {
  title: "Components/Onboarding/TermsContent",
  component: TermsContent,
};

export default meta;
type Story = StoryObj<typeof TermsContent>;

export const Default: Story = {
  args: {},
};
