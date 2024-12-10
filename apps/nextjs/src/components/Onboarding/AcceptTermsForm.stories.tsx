import type { Meta, StoryObj } from "@storybook/react";

import { chromaticParams } from "../../../.storybook/chromatic";
import { AcceptTermsForm } from "./AcceptTermsForm";

const meta: Meta<typeof AcceptTermsForm> = {
  title: "Pages/Onboarding/AcceptTermsForm",
  component: AcceptTermsForm,
  parameters: {
    ...chromaticParams(["mobile", "legacy"]),
  },
};

export default meta;
type Story = StoryObj<typeof AcceptTermsForm>;

export const Default: Story = {
  args: {},
};
