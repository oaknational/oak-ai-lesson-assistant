import type { Meta, StoryObj } from "@storybook/react";

import { chromaticParams } from "@/storybook/chromatic";
import { MathJaxDecorator } from "@/storybook/decorators/MathJaxDecorator";

import { SectionContent } from "./index";

const meta = {
  title: "Components/SectionContent",
  component: SectionContent,
  tags: ["autodocs"],
  decorators: [MathJaxDecorator],
  parameters: {
    ...chromaticParams(["desktop"]),
  },
  args: {
    sectionKey: "learningOutcome",
    value: "Students will learn about the water cycle and its importance.",
  },
} satisfies Meta<typeof SectionContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Markdown: Story = {
  args: {
    sectionKey: "learningOutcome",
    value: `# Learning Outcomes

Students will be able to:
- **Identify** the stages of the water cycle
- *Explain* how evaporation and condensation work
- Create a diagram showing the water cycle

## Key Concepts
1. Evaporation
2. Condensation
3. Precipitation
4. Collection`,
  },
};

export const WithMath: Story = {
  args: {
    sectionKey: "learningOutcome",
    value: `# Mathematical Concepts

Students will understand:
- The formula for area: $A = \\pi r^2$
- Basic algebra: $ax + b = c$
- Complex equations: 
  $$\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$`,
  },
};

export const StartQuiz: Story = {
  args: {
    sectionKey: "starterQuiz",
    value: [
      {
        question: "What is the capital of France?",
        answers: ["Paris"],
        distractors: ["London", "Berlin", "Madrid"],
      },
      {
        question: "Which of the following is a prime number?",
        answers: ["7"],
        distractors: ["4", "6", "8"],
      },
    ],
  },
};

export const StartQuizWithMath: Story = {
  args: {
    sectionKey: "starterQuiz",
    value: [
      {
        question: "What is the value of $$x$$ in the equation $$2x + 5 = 13$$?",
        answers: ["4"],
        distractors: ["3", "5", "6"],
      },
      {
        question:
          "Calculate the area of a circle with radius $$r = 3$$cm using $$A = \\pi r^2$$",
        answers: ["$$9\\pi$$ cm²"],
        distractors: ["$$6\\pi$$ cm²", "$$12\\pi$$ cm²", "$$18\\pi$$ cm²"],
      },
    ],
  },
};

export const QuizWithHints: Story = {
  args: {
    sectionKey: "starterQuiz",
    value: [
      {
        question: "What is the largest planet in our solar system?",
        answers: ["Jupiter"],
        distractors: ["Earth", "Saturn", "Neptune"],
      },
    ],
  },
};
