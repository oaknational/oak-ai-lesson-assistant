import type { Meta, StoryObj } from "@storybook/react";

import { chromaticParams } from "@/storybook/chromatic";

import {
  mockRefetchSafetyViolations,
  mockSafetyViolations,
  userIds,
} from "../../fixtures/safetyViolations";
import { AdminUserView } from "./view";

const meta = {
  title: "Pages/Admin/Users/[userId]/View",
  component: AdminUserView,
  parameters: {
    ...chromaticParams(["desktop"]),
  },
} satisfies Meta<typeof AdminUserView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    userId: userIds.withViolations,
    safetyViolations: mockSafetyViolations,
    refetchSafetyViolations: mockRefetchSafetyViolations,
  },
};

export const WithNoViolations: Story = {
  args: {
    userId: userIds.clean,
    safetyViolations: [],
    refetchSafetyViolations: mockRefetchSafetyViolations,
  },
};
