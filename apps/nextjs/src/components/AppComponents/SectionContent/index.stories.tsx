import type { Meta, StoryObj } from "@storybook/react";
import type { QuizV1Question } from "@oakai/aila/src/protocol/schema";

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

export const WithMaths: Story = {
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

export const Quiz: Story = {
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
    ] satisfies QuizV1Question[],
  },
};

export const QuizWithMaths: Story = {
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
    ] satisfies QuizV1Question[],
  },
};

export const WithHints: Story = {
  args: {
    sectionKey: "starterQuiz",
    value: [
      {
        question: "What is the largest planet in our solar system?",
        answers: ["Jupiter"],
        distractors: ["Earth", "Saturn", "Neptune"],
      },
    ] satisfies QuizV1Question[],
  },
};

export const QuizWithImages: Story = {
  args: {
    sectionKey: "starterQuiz",
    value: [
      {
        question: "40 is a multiple of 8. Which multiples of 8 are adjacent to 40?\n\n![Number squares showing 40](https://oaknationalacademy-res.cloudinary.com/image/upload/v1706266807/a3g7nwse0lqdvrggp1vt.png)",
        answers: ["32", "48"],
        distractors: ["34", "50", "47"],
      },
      {
        question: "Which mixed operation equation can be used to calculate the missing multiple of 8?\n\n![Number line with missing value](https://oaknationalacademy-res.cloudinary.com/image/upload/v1706266808/pggweqwl9chfutuul4pm.png)",
        answers: ["5 × 8 − 8", "3 × 8 + 8"],
        distractors: ["4 groups of 8", "8 x 4"],
      },
      {
        question: "Here is part of the 8 times table grid. What could Izzy do to find 13 × 8 quickly?\n\n![8 times table grid](https://oaknationalacademy-res.cloudinary.com/image/upload/v1706266809/pm6upn12cjexhp4xcccg.png)",
        answers: ["12 x 8 + 8", "Increase 96 by 8"],
        distractors: ["Count in eights from zero"],
      },
      {
        // TODO: This use case (images in answer choices) is not fully implemented yet
        // and currently renders poorly. The images appear inline with text and need
        // proper layout/styling for a better visual presentation.
        question: "Which diagram shows 3 groups of 8?",
        answers: ["![3 groups of 8 dots](https://oaknationalacademy-res.cloudinary.com/image/upload/v1706266807/a3g7nwse0lqdvrggp1vt.png)"],
        distractors: [
          "![2 groups of 8 dots](https://oaknationalacademy-res.cloudinary.com/image/upload/v1706266808/pggweqwl9chfutuul4pm.png)",
          "![4 groups of 8 dots](https://oaknationalacademy-res.cloudinary.com/image/upload/v1706266809/pm6upn12cjexhp4xcccg.png)",
        ],
      },
    ] satisfies QuizV1Question[],
  },
};
