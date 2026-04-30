import type { Meta, StoryObj } from "@storybook/nextjs";

import { chromaticParams } from "@/storybook/chromatic";

import {
  mockRefetchSafetyViolations,
  mockSafetyViolations,
  mockThreatDetections,
  userIds,
} from "../../fixtures/safetyViolations.fixture";
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
    maxAllowedSafetyViolations: 5,
    threatDetections: mockThreatDetections,
    refetchUserSafetyReview: mockRefetchSafetyViolations,
  },
};

export const WithNoViolations: Story = {
  args: {
    userId: userIds.clean,
    safetyViolations: [],
    maxAllowedSafetyViolations: 5,
    threatDetections: [],
    refetchUserSafetyReview: mockRefetchSafetyViolations,
  },
};

export const ThreatDetectionsOnly: Story = {
  args: {
    userId: userIds.withViolations,
    safetyViolations: [],
    maxAllowedSafetyViolations: 5,
    threatDetections: mockThreatDetections.map((td) => ({
      ...td,
      isFalsePositive: true,
      safetyViolationId: null,
      safetyViolation: null,
    })),
    refetchUserSafetyReview: mockRefetchSafetyViolations,
  },
};

export const SafetyViolationsOnly: Story = {
  args: {
    userId: userIds.withViolations,
    safetyViolations: mockSafetyViolations,
    maxAllowedSafetyViolations: 5,
    threatDetections: [],
    refetchUserSafetyReview: mockRefetchSafetyViolations,
  },
};
