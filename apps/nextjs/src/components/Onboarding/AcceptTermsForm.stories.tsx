import type { Meta, StoryObj } from "@storybook/react";

import { chromaticParams } from "@/storybook/chromatic";

import { AcceptTermsForm } from "./AcceptTermsForm";

const meta = {
  title: "Pages/Onboarding/AcceptTermsForm",
  component: AcceptTermsForm,
  parameters: {
    ...chromaticParams(["mobile", "desktop"]),
  },
} satisfies Meta<typeof AcceptTermsForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
