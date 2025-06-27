import type { Meta, StoryObj } from "@storybook/react";

import { chromaticParams } from "@/storybook/chromatic";
import { MathJaxDecorator } from "@/storybook/decorators/MathJaxDecorator";

import StaticLessonPlanRenderer from "./static-lesson-plan-renderer";

const meta = {
  title: "Components/StaticLessonPlanRenderer",
  component: StaticLessonPlanRenderer,
  tags: ["autodocs"],
  decorators: [MathJaxDecorator],
  parameters: {
    ...chromaticParams(["desktop"]),
  },
  args: {
    lessonPlan: {
      title: "About Frogs",
      keyStage: "Key Stage 2",
      subject: "Science",
      topic: "Amphibians",
      learningOutcome:
        "Students will understand the characteristics of amphibians",
      starterQuiz: [
        {
          question: "What do you know about frogs?",
          answers: ["They are amphibians"],
          distractors: ["They are reptiles", "They are fish"],
        },
      ],
      keyLearningPoints: [
        "Frogs are amphibians",
        "They live in water and on land",
      ],
    },
  },
} satisfies Meta<typeof StaticLessonPlanRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithTooltips: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Shows section titles with info tooltips - the key feature of the static renderer.",
      },
    },
  },
};
