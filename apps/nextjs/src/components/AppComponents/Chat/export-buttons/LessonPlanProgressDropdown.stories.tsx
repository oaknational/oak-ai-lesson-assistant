import type {
  Cycle,
  Keyword,
  Misconception,
  Quiz,
} from "@oakai/aila/src/protocol/schema";

import type { Meta, StoryObj } from "@storybook/react";

import { chromaticParams } from "@/storybook/chromatic";
import { StoreDecorator } from "@/storybook/decorators/StoreDecorator";

import { LessonPlanProgressDropdown } from "./LessonPlanProgressDropdown";

const meta = {
  title: "Components/LessonPlan/LessonPlanProgressDropdown",
  component: LessonPlanProgressDropdown,
  decorators: [StoreDecorator],
  tags: ["autodocs"],
  args: {
    sectionRefs: {
      title: { current: null },
      keyStage: { current: null },
      subject: { current: null },
      learningOutcome: { current: null },
      learningCycles: { current: null },
      priorKnowledge: { current: null },
      cycle1: { current: null },
      cycle2: { current: null },
      cycle3: { current: null },
    },
    documentContainerRef: { current: null },
  },
  parameters: {
    chatStoreState: {
      ailaStreamingStatus: "Idle",
    },
    ...chromaticParams(["desktop"]),
  },
} satisfies Meta<typeof LessonPlanProgressDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    lessonPlanStoreState: {
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
    },
  },
};

export const PartiallyCompleted: Story = {
  parameters: {
    chatStoreState: {
      ailaStreamingStatus: "StreamingLessonPlan",
    },
    lessonPlanStoreState: {
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
  },
};

export const FullyCompleted: Story = {
  parameters: {
    lessonPlanStoreState: {
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
  },
};

export const PartialCycles: Story = {
  parameters: {
    lessonPlanStoreState: {
      lessonPlan: {
        // 1 - 4
        ...(Default?.parameters?.lessonPlanStoreState?.lessonPlan ?? {}),
        // 5
        cycle1: sampleCycle(1),
        cycle2: sampleCycle(2),
        // cycle3 is missing, but that is sufficient for downloads
      },
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
