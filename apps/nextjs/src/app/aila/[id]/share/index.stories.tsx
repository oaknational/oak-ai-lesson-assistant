import type { LooseLessonPlan } from "@oakai/aila/src/protocol/schema";
import type { Meta, StoryObj } from "@storybook/react";

import { chromaticParams } from "../../../../../.storybook/chromatic";
import ShareChat from "./";

const meta: Meta<typeof ShareChat> = {
  title: "Pages/Chat/Share",
  component: ShareChat,
  parameters: {
    layout: "fullscreen",
    ...chromaticParams(["mobile", "desktop"]),
  },
};

export default meta;
type Story = StoryObj<typeof ShareChat>;

const lessonPlan: LooseLessonPlan = {
  title: "The End of Roman Britain",
  subject: "history",
  keyStage: "key-stage-3",
  learningOutcome:
    "I can explain the factors leading to the end of Roman rule in Britain and its impact on society.",
  learningCycles: [
    "Identify the key factors that led to the exit of the Romans from Britain.",
    "Discuss the immediate social and economic impacts of the Roman departure on Britain.",
    "Explore how archaeologists have uncovered evidence of the Roman era in Britain.",
  ],
};

export const Default: Story = {
  args: {
    lessonPlan,
    creatorsName: "Mr Teacher",
    moderation: {
      id: "mock-moderation-id",
      categories: ["l/strong-language"],
      justification: "Mock sensitive result",
    },
  },
};
