import type {
  Cycle,
  Keyword,
  Misconception,
  Quiz,
} from "@oakai/aila/src/protocol/schema";
import type { Meta, StoryObj } from "@storybook/react";

import { LessonPlanProgressDropdown } from "./LessonPlanProgressDropdown";

const meta: Meta<typeof LessonPlanProgressDropdown> = {
  title: "Components/LessonPlan/LessonPlanProgressDropdown",
  component: LessonPlanProgressDropdown,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof LessonPlanProgressDropdown>;

export const Default: Story = {
  args: {
    lessonPlan: {
      // 1 (lesson details)
      title: "Introduction to Glaciation",
      keyStage: "key-stage-3",
      subject: "geography",
      // 2
      learningOutcome: "Sample learning outcome",
      // 3
      learningCycles: ["Sample learning cycles"],
      // 4
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
      // 1 (lesson details)
      title: "Introduction to Glaciation",
      keyStage: "key-stage-3",
      subject: "geography",
      // 2
      learningOutcome: "Sample learning outcome",
      // 3
      learningCycles: ["Sample learning cycles"],
      // 4
      priorKnowledge: ["Sample prior knowledge"],
      // 5
      keyLearningPoints: ["Sample key learning point"],
      // 6
      misconceptions: [sampleMisconception()],
      // 7
      cycle1: sampleCycle(1),
      // Only cycle1 is completed, but that is sufficient for downloads
    },
  },
};

export const FullyCompleted: Story = {
  args: {
    ...Default.args,
    lessonPlan: {
      // 1 (lesson details)
      title: "Introduction to Glaciation",
      keyStage: "key-stage-3",
      subject: "geography",
      // 2
      learningOutcome: "Sample learning outcome",
      // 3
      learningCycles: ["Sample learning cycles"],
      // 4
      priorKnowledge: ["Sample prior knowledge"],
      // 5
      keyLearningPoints: ["Sample key learning points"],
      // 6
      misconceptions: [sampleMisconception()],
      // 7
      keywords: [sampleKeyword()],
      // 8
      starterQuiz: sampleQuiz(),
      // 9
      cycle1: sampleCycle(1),
      cycle2: sampleCycle(2),
      cycle3: sampleCycle(3),
      // 10
      exitQuiz: sampleQuiz(),
      additionalMaterials: "Sample additional materials",
    },
  },
};

export const PartialCycles: Story = {
  args: {
    ...Default.args,
    lessonPlan: {
      // 1 - 4
      ...(Default?.args?.lessonPlan ?? {}),
      // 5
      cycle1: sampleCycle(1),
      cycle2: sampleCycle(2),
      // cycle3 is missing, but that is sufficient for downloads
    },
  },
};

function sampleCycle(i: number): Cycle {
  return {
    title: `Sample cycle ${i}`,
    durationInMinutes: 10,
    explanation: {
      spokenExplanation: "Sample spoken explanation",
      accompanyingSlideDetails: "Sample slide details",
      imagePrompt: "Sample image prompt",
      slideText: "Sample slide text",
    },
    checkForUnderstanding: [
      {
        question: "Sample question",
        answers: ["Sample answer"],
        distractors: ["Sample distractor"],
      },
    ],
    practice: "Sample practice",
    feedback: "Sample feedback",
  };
}

function sampleMisconception(): Misconception {
  return {
    misconception: "Sample misconception",
    description: "Sample description",
  };
}

function sampleKeyword(): Keyword {
  return {
    keyword: "Sample keyword",
    definition: "Sample description",
  };
}

function sampleQuiz(): Quiz {
  return [
    {
      question: "Sample question",
      answers: ["Sample answer"],
      distractors: ["Sample distractor"],
    },
  ];
}
