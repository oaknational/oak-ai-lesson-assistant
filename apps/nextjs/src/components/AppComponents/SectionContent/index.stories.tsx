import type { QuizV1Question } from "@oakai/aila/src/protocol/schemas/quiz/quizV1";

import type { Meta, StoryObj } from "@storybook/nextjs";

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
    value: {
      version: "v3" as const,
      imageMetadata: [],
      questions: [
        {
          questionType: "multiple-choice" as const,
          question: "What is the capital of France?",
          answers: ["Paris"],
          distractors: ["London", "Berlin", "Madrid"],
          hint: null,
        },
        {
          questionType: "multiple-choice" as const,
          question: "Which of the following is a prime number?",
          answers: ["7"],
          distractors: ["4", "6", "8"],
          hint: null,
        },
      ],
    },
  },
};

export const QuizWithMaths: Story = {
  args: {
    sectionKey: "starterQuiz",
    value: {
      version: "v3" as const,
      imageMetadata: [],
      questions: [
        {
          questionType: "multiple-choice" as const,
          question:
            "What is the value of $$x$$ in the equation $$2x + 5 = 13$$?",
          answers: ["4"],
          distractors: ["3", "5", "6"],
          hint: null,
        },
        {
          questionType: "multiple-choice" as const,
          question:
            "Calculate the area of a circle with radius $$r = 3$$cm using $$A = \\pi r^2$$",
          answers: ["$$9\\pi$$ cm²"],
          distractors: ["$$6\\pi$$ cm²", "$$12\\pi$$ cm²", "$$18\\pi$$ cm²"],
          hint: null,
        },
      ],
    },
  },
};

export const QuizWithImages: Story = {
  args: {
    sectionKey: "starterQuiz",
    value: {
      version: "v3" as const,
      imageMetadata: [
        {
          imageUrl:
            "https://oaknationalacademy-res.cloudinary.com/image/upload/v1706266807/a3g7nwse0lqdvrggp1vt.png",
          attribution: "Pixabay",
          width: 800,
          height: 600,
        },
        {
          imageUrl:
            "https://oaknationalacademy-res.cloudinary.com/image/upload/v1706266808/pggweqwl9chfutuul4pm.png",
          attribution: "Oak National Academy",
          width: 800,
          height: 600,
        },
        {
          imageUrl:
            "https://oaknationalacademy-res.cloudinary.com/image/upload/v1706266809/pm6upn12cjexhp4xcccg.png",
          attribution: "Pixabay",
          width: 800,
          height: 600,
        },
      ],
      questions: [
        {
          questionType: "multiple-choice" as const,
          question:
            "40 is a multiple of 8. Which multiples of 8 are adjacent to 40?\n\n![Number squares showing 40](https://oaknationalacademy-res.cloudinary.com/image/upload/v1706266807/a3g7nwse0lqdvrggp1vt.png)",
          answers: ["32", "48"],
          distractors: ["34", "50", "47"],
          hint: null,
        },
        {
          questionType: "multiple-choice" as const,
          question:
            "Which mixed operation equation can be used to calculate the missing multiple of 8?\n\n![Number line with missing value](https://oaknationalacademy-res.cloudinary.com/image/upload/v1706266808/pggweqwl9chfutuul4pm.png)",
          answers: ["5 × 8 − 8", "3 × 8 + 8"],
          distractors: ["4 groups of 8", "8 x 4"],
          hint: null,
        },
        {
          questionType: "multiple-choice" as const,
          question:
            "Here is part of the 8 times table grid. What could Izzy do to find 13 × 8 quickly?\n\n![8 times table grid](https://oaknationalacademy-res.cloudinary.com/image/upload/v1706266809/pm6upn12cjexhp4xcccg.png)", // cspell:disable-line
          answers: ["12 x 8 + 8", "Increase 96 by 8"],
          distractors: ["Count in eights from zero"],
          hint: null,
        },
        {
          // TODO: This use case (images in answer choices) is not fully implemented yet
          // and currently renders poorly. The images appear inline with text and need
          // proper layout/styling for a better visual presentation.
          questionType: "multiple-choice" as const,
          question: "Which diagram shows 3 groups of 8?",
          answers: [
            "![3 groups of 8 dots](https://oaknationalacademy-res.cloudinary.com/image/upload/v1706266807/a3g7nwse0lqdvrggp1vt.png)",
          ],
          distractors: [
            "![2 groups of 8 dots](https://oaknationalacademy-res.cloudinary.com/image/upload/v1706266808/pggweqwl9chfutuul4pm.png)",
            "![4 groups of 8 dots](https://oaknationalacademy-res.cloudinary.com/image/upload/v1706266809/pm6upn12cjexhp4xcccg.png)",
          ],
          hint: null,
        },
      ],
    },
  },
};

export const Cycle: Story = {
  args: {
    sectionKey: "cycle1",
    value: {
      title: "Understanding Photosynthesis",
      durationInMinutes: 15,
      explanation: {
        spokenExplanation: `Photosynthesis is the process by which plants use sunlight, water, and carbon dioxide to create oxygen and energy in the form of sugar.

The process occurs in two stages:
- **Light-dependent reactions**: Occur in the thylakoid membranes
- **Light-independent reactions** (Calvin cycle): Occur in the stroma

The overall equation is:
6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂`,
      },
      checkForUnderstanding: [
        {
          question: "What are the main inputs required for photosynthesis?",
          answers: ["Sunlight, water, and carbon dioxide"],
          distractors: [
            "Oxygen and glucose",
            "Sugar and minerals",
            "Nitrogen and phosphorus",
          ],
        },
        {
          question: "Where do the light-dependent reactions occur?",
          answers: ["In the thylakoid membranes"],
          distractors: [
            "In the stroma",
            "In the cell nucleus",
            "In the mitochondria",
          ],
        },
      ] satisfies QuizV1Question[],
      practice: `1. Draw a simple diagram of a chloroplast and label:
   - Thylakoid membranes
   - Stroma
   - Outer membrane

2. Create a flowchart showing the inputs and outputs of photosynthesis

3. Explain why plants appear green to our eyes`,
      feedback: `Well done! You've learned about photosynthesis. Remember:
- Plants are producers that make their own food
- Photosynthesis provides oxygen for all living things
- The process converts light energy into chemical energy`,
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shows how learning cycles are rendered with check for understanding quizzes using V2 components. Demonstrates the visual consistency with other sections through the prose styling.",
      },
    },
  },
};
