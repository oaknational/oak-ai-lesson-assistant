import type { StarterQuiz as StarterQuizType } from "@oakai/additional-materials/src/documents/teachingMaterials/starterQuiz/schema";

import type { Meta, StoryObj } from "@storybook/react";

import { chromaticParams } from "@/storybook/chromatic";

import { Quiz } from "./Quiz";

const quizFixture: StarterQuizType = {
  year: "Year 5",
  subject: "Science",
  title: "Photosynthesis Quiz",
  questions: [
    {
      question: "What do plants need for photosynthesis?",
      options: [
        { text: "Sunlight", isCorrect: true },
        { text: "Milk", isCorrect: false },
        { text: "Sand", isCorrect: false },
      ],
    },
    {
      question: "What is the green pigment in plants called?",
      options: [
        { text: "Chlorophyll", isCorrect: true },
        { text: "Hemoglobin", isCorrect: false },
        { text: "Melanin", isCorrect: false },
      ],
    },
  ],
};

const meta: Meta<typeof Quiz> = {
  title: "Components/TeachingMaterials/Quiz",
  component: Quiz,
  parameters: {
    // Including custom decorators changes the layout from fullscreen
    layout: "fullscreen",
    ...chromaticParams(["mobile", "desktop"]),
  },
};
export default meta;

type Story = StoryObj<typeof Quiz>;

export const TeachingMaterialQuiz: Story = {
  args: {
    generation: quizFixture,
    action: "view",
  },
};
