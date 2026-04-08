import type { Meta, StoryObj } from "@storybook/nextjs";

import { chromaticParams } from "@/storybook/chromatic";

import { LockingModerationModalContent } from "./LockingModerationModalContent";

const meta = {
  title: "Components/Moderation/LockingModerationModalContent",
  component: LockingModerationModalContent,
  tags: ["autodocs"],
  parameters: {
    ...chromaticParams(["desktop"]),
  },
  args: {
    onClose: () => {},
    showFeedback: false,
    setShowFeedback: () => {},
    comment: "",
    setComment: () => {},
    hasSubmitted: false,
    isValid: false,
    handleSubmit: () => {},
    isLoading: false,
  },
} satisfies Meta<typeof LockingModerationModalContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HighlySensitive: Story = {
  args: {
    heading: "Highly sensitive topic",
    body: "Aila is not able to plan lessons on this topic. While important and potentially suitable for the classroom, some topics are too complex or sensitive for AI to reliably generate content on at the moment.",
  },
};

export const Toxic: Story = {
  args: {
    heading: "Potential misuse of Aila detected",
    body: "Aila is designed to create classroom-appropriate content. This lesson has been identified as potentially unsuitable, preventing you from continuing to create this lesson.",
  },
};

export const WithFeedback: Story = {
  args: {
    heading: "Highly sensitive topic",
    body: "Aila is not able to plan lessons on this topic.",
    showFeedback: true,
  },
};

export const FeedbackSubmitted: Story = {
  args: {
    heading: "Highly sensitive topic",
    body: "Aila is not able to plan lessons on this topic.",
    showFeedback: true,
    hasSubmitted: true,
  },
};
