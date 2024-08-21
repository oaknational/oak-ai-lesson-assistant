import type { Meta, StoryObj } from "@storybook/react";

import { LessonPlanProgressDropdown } from "./LessonPlanProgressDropdown";

const meta: Meta<typeof LessonPlanProgressDropdown> = {
  title: "Components/LessonPlanProgressDropdown",
  component: LessonPlanProgressDropdown,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof LessonPlanProgressDropdown>;

export const Default: Story = {
  args: {
    lessonPlan: {
      title: "Introduction to Glaciation",
      keyStage: "key-stage-3",
      subject: "geography",
      learningOutcome: "Sample learning outcome",
      learningCycles: ["Sample learning cycles"],
      priorKnowledge: ["Sample prior knowledge"],
    },
    sectionRefs: {
      title: { current: null },
      keyStage: { current: null },
      subject: { current: null },
      learningOutcome: { current: null },
      learningCycles: { current: null },
      priorKnowledge: { current: null },
      "cycle-1": { current: null },
      "cycle-2": { current: null },
      "cycle-3": { current: null },
    },
    documentContainerRef: { current: null },
  },
};

export const PartiallyCompleted: Story = {
  args: {
    ...Default.args,
    lessonPlan: {
      ...(Default?.args?.lessonPlan ?? {}),
      keyLearningPoints: ["Sample key learning point"],
      misconceptions: [{ misconception: "Sample misconception" }],
      cycle1: { title: "Sample cycle 1" },
      // Only cycle1 is completed
    },
  },
};

export const FullyCompleted: Story = {
  args: {
    ...Default.args,
    lessonPlan: {
      title: "Introduction to Glaciation",
      keyStage: "key-stage-3",
      subject: "geography",
      learningOutcome: "Sample learning outcome",
      learningCycles: ["Sample learning cycles"],
      priorKnowledge: ["Sample prior knowledge"],
      keyLearningPoints: ["Sample key learning points"],
      misconceptions: [{ misconception: "Sample misconceptions" }],
      keywords: [{ keyword: "Sample keyword" }],
      starterQuiz: [
        { question: "Sample starter quiz", answers: ["Sample answer"] },
      ],
      cycle1: { title: "Sample cycle 1" },
      cycle2: { title: "Sample cycle 2" },
      cycle3: { title: "Sample cycle 3" },
      exitQuiz: [{ question: "Sample exit quiz", answers: ["Answer"] }],
      additionalMaterials: "Sample additional materials",
    },
  },
};

export const PartialCycles: Story = {
  args: {
    ...Default.args,
    lessonPlan: {
      ...(Default?.args?.lessonPlan ?? {}),
      cycle1: { title: "Sample cycle 1" },
      cycle2: { title: "Sample cycle 2" },
      // cycle3 is missing
    },
  },
};
