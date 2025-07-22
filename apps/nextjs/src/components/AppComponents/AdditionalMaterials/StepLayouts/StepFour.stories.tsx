import React from "react";

import type { RefinementOption } from "@oakai/additional-materials/src/documents/additionalMaterials/resourceTypes";

import type { Meta, StoryObj } from "@storybook/react";

import { DemoProvider } from "@/components/ContextProviders/Demo";
import TeachingMaterialsLayout from "@/components/ResourcesLayout";
import { chromaticParams } from "@/storybook/chromatic";
import { DialogContentDecorator } from "@/storybook/decorators/DialogContentDecorator";
import { TeachingMaterialsStoreDecorator } from "@/storybook/decorators/TeachingMaterialsStoreDecorator";

import StepFour from "./StepFour";

const meta = {
  title: "Components/AdditionalMaterials/StepLayouts/StepFour",
  component: StepFour,
  decorators: [TeachingMaterialsStoreDecorator, DialogContentDecorator],
  parameters: {
    ...chromaticParams(["mobile", "desktop"]),
    layout: "fullscreen",
    resourcesStoreState: {
      pageData: {
        lessonPlan: {
          lessonId: "lesson-123",
          title: "Introduction to Fractions",
          keyStage: "KS2",
          subject: "Mathematics",
          topic: "Fractions",
          learningOutcome: "Students will understand basic fraction concepts",
        },
      },
      docType: "additional-starter-quiz",
    },
  },
} satisfies Meta<typeof StepFour>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseDecorators = [
  (Story: React.ComponentType) => (
    <DemoProvider>
      <TeachingMaterialsLayout
        title="Introduction to Fractions"
        subTitle="Year 4 • Mathematics"
        step={4}
        docTypeName="Starter Quiz"
      >
        <Story />
      </TeachingMaterialsLayout>
    </DemoProvider>
  ),
];

export const StarterQuiz: Story = {
  args: {
    handleRefineMaterial: (_refinementValue: RefinementOption) => {
      return Promise.resolve();
    },
  },
  parameters: {
    resourcesStoreState: {
      pageData: {
        lessonPlan: {
          lessonId: "lesson-123",
          title: "Introduction to Fractions",
          keyStage: "KS2",
          subject: "Mathematics",
          topic: "Fractions",
          learningOutcome: "Students will understand basic fraction concepts",
        },
      },
      docType: "additional-starter-quiz",
      generation: {
        year: "Year 4",
        subject: "Mathematics",
        title: "Introduction to Fractions - Starter Quiz",
        questions: [
          {
            question: "What is a fraction?",
            options: [
              { text: "A whole number", isCorrect: false },
              { text: "A part of a whole", isCorrect: true },
              { text: "A decimal number", isCorrect: false },
            ],
          },
          {
            question: "In the fraction 1/4, what does the number 4 represent?",
            options: [
              { text: "The numerator", isCorrect: false },
              { text: "The denominator", isCorrect: true },
              { text: "The whole number", isCorrect: false },
            ],
          },
          {
            question: "Which fraction represents half?",
            options: [
              { text: "1/4", isCorrect: false },
              { text: "1/2", isCorrect: true },
              { text: "1/3", isCorrect: false },
            ],
          },
          {
            question: "What does the numerator tell us?",
            options: [
              { text: "How many parts we have", isCorrect: true },
              {
                text: "How many equal parts the whole is divided into",
                isCorrect: false,
              },
              { text: "The size of each part", isCorrect: false },
            ],
          },
          {
            question: "Which is larger: 1/2 or 1/3?",
            options: [
              { text: "1/2", isCorrect: true },
              { text: "1/3", isCorrect: false },
              { text: "They are equal", isCorrect: false },
            ],
          },
          {
            question: "What is 1/4 + 1/4?",
            options: [
              { text: "1/8", isCorrect: false },
              { text: "2/4 or 1/2", isCorrect: true },
              { text: "1/2", isCorrect: false },
            ],
          },
          {
            question: "In the fraction 3/5, what is the numerator?",
            options: [
              { text: "3", isCorrect: true },
              { text: "5", isCorrect: false },
              { text: "8", isCorrect: false },
            ],
          },
          {
            question: "How many quarters make a whole?",
            options: [
              { text: "2", isCorrect: false },
              { text: "3", isCorrect: false },
              { text: "4", isCorrect: true },
            ],
          },
          {
            question: "Which fraction is equivalent to 2/4?",
            options: [
              { text: "1/2", isCorrect: true },
              { text: "1/4", isCorrect: false },
              { text: "3/4", isCorrect: false },
            ],
          },
          {
            question:
              "What fraction of this shape is shaded if 3 out of 6 parts are coloured?",
            options: [
              { text: "3/6 or 1/2", isCorrect: true },
              { text: "6/3", isCorrect: false },
              { text: "3/3", isCorrect: false },
            ],
          },
        ],
      },
    },
  },
  decorators: baseDecorators,
};

export const ExitQuiz: Story = {
  args: {
    handleRefineMaterial: (_refinementValue: RefinementOption) => {
      return Promise.resolve();
    },
  },
  parameters: {
    resourcesStoreState: {
      pageData: {
        lessonPlan: {
          lessonId: "lesson-123",
          title: "Introduction to Fractions",
          keyStage: "KS2",
          subject: "Mathematics",
          topic: "Fractions",
          learningOutcome: "Students will understand basic fraction concepts",
        },
      },
      docType: "additional-exit-quiz",
      generation: {
        year: "Year 4",
        subject: "Mathematics",
        title: "Introduction to Fractions - Exit Quiz",
        questions: [
          {
            question: "Convert 1/2 to a decimal:",
            options: [
              { text: "0.25", isCorrect: false },
              { text: "0.5", isCorrect: true },
              { text: "0.75", isCorrect: false },
            ],
          },
          {
            question: "Which is larger: 1/3 or 1/4?",
            options: [
              { text: "1/3", isCorrect: true },
              { text: "1/4", isCorrect: false },
              { text: "They are equal", isCorrect: false },
            ],
          },
          {
            question: "What is 1/4 + 1/4?",
            options: [
              { text: "1/8", isCorrect: false },
              { text: "2/4 or 1/2", isCorrect: true },
              { text: "1/2", isCorrect: false },
            ],
          },
          {
            question: "Simplify the fraction 6/8:",
            options: [
              { text: "3/4", isCorrect: true },
              { text: "6/8", isCorrect: false },
              { text: "2/3", isCorrect: false },
            ],
          },
          {
            question: "Which fraction is closest to 1?",
            options: [
              { text: "7/8", isCorrect: true },
              { text: "1/2", isCorrect: false },
              { text: "3/4", isCorrect: false },
            ],
          },
          {
            question: "What is 3/4 - 1/4?",
            options: [
              { text: "2/4 or 1/2", isCorrect: true },
              { text: "2/0", isCorrect: false },
              { text: "4/8", isCorrect: false },
            ],
          },
          {
            question: "Order from smallest to largest: 1/4, 1/2, 1/3",
            options: [
              { text: "1/4, 1/3, 1/2", isCorrect: true },
              { text: "1/2, 1/3, 1/4", isCorrect: false },
              { text: "1/3, 1/4, 1/2", isCorrect: false },
            ],
          },
          {
            question: "If you eat 2/8 of a pizza, how much is left?",
            options: [
              { text: "6/8 or 3/4", isCorrect: true },
              { text: "2/8", isCorrect: false },
              { text: "1/4", isCorrect: false },
            ],
          },
          {
            question: "Which pairs of fractions are equivalent?",
            options: [
              { text: "2/4 and 1/2", isCorrect: true },
              { text: "1/3 and 2/6", isCorrect: false },
              { text: "3/4 and 6/9", isCorrect: false },
            ],
          },
          {
            question: "What fraction represents three-quarters?",
            options: [
              { text: "3/4", isCorrect: true },
              { text: "4/3", isCorrect: false },
              { text: "1/4", isCorrect: false },
            ],
          },
        ],
      },
    },
  },
  decorators: [
    (Story: React.ComponentType) => (
      <DemoProvider>
        <TeachingMaterialsLayout
          title="Introduction to Fractions"
          subTitle="Year 4 • Mathematics"
          step={4}
          docTypeName="Exit Quiz"
        >
          <Story />
        </TeachingMaterialsLayout>
      </DemoProvider>
    ),
  ],
};

export const Comprehension: Story = {
  args: {
    handleRefineMaterial: (_refinementValue: RefinementOption) => {
      return Promise.resolve();
    },
  },
  parameters: {
    resourcesStoreState: {
      pageData: {
        lessonPlan: {
          lessonId: "lesson-123",
          title: "Introduction to Fractions",
          keyStage: "KS2",
          subject: "Mathematics",
          topic: "Fractions",
          learningOutcome: "Students will understand basic fraction concepts",
        },
      },
      docType: "additional-comprehension",
      generation: {
        comprehension: {
          lessonTitle: "Introduction to Fractions",
          yearGroup: "Year 4",
          subject: "Mathematics",
          instructions:
            "Read the passage carefully and answer the questions below. Use complete sentences where appropriate.",
          text: "Fractions are everywhere around us! When you eat half a pizza, you're eating 1/2 of the whole pizza. When you drink a quarter of a glass of water, you're drinking 1/4 of the water. Fractions help us describe parts of things. The top number in a fraction is called the numerator. It tells us how many parts we have. The bottom number is called the denominator. It tells us how many equal parts the whole thing is divided into. For example, in the fraction 3/4, the 3 is the numerator (we have 3 parts) and the 4 is the denominator (the whole is divided into 4 equal parts). Understanding fractions is important because we use them in cooking, sharing things fairly, and measuring. When a recipe calls for 1/2 cup of flour, you need to understand what that means!",
          questions: [
            {
              questionNumber: 1,
              questionText: "What does the numerator tell us in a fraction?",
              answer: "The numerator tells us how many parts we have.",
            },
            {
              questionNumber: 2,
              questionText: "What does the denominator tell us in a fraction?",
              answer:
                "The denominator tells us how many equal parts the whole thing is divided into.",
            },
            {
              questionNumber: 3,
              questionText:
                "Give an example of when you might use fractions in everyday life.",
              answer:
                "Examples include eating part of a pizza, sharing things fairly, cooking recipes, or measuring ingredients.",
            },
            {
              questionNumber: 4,
              questionText:
                "In the fraction 2/5, which number is the numerator and which is the denominator?",
              answer: "In 2/5, the numerator is 2 and the denominator is 5.",
            },
            {
              questionNumber: 5,
              questionText:
                "According to the passage, why is understanding fractions important?",
              answer:
                "Understanding fractions is important because we use them in cooking, sharing things fairly, and measuring.",
            },
          ],
        },
      },
    },
  },
  decorators: [
    (Story: React.ComponentType) => (
      <DemoProvider>
        <TeachingMaterialsLayout
          title="Introduction to Fractions"
          subTitle="Year 4 • Mathematics"
          step={4}
          docTypeName="Comprehension"
        >
          <Story />
        </TeachingMaterialsLayout>
      </DemoProvider>
    ),
  ],
};

export const Glossary: Story = {
  args: {
    handleRefineMaterial: (_refinementValue: RefinementOption) => {
      return Promise.resolve();
    },
  },
  parameters: {
    resourcesStoreState: {
      pageData: {
        lessonPlan: {
          lessonId: "lesson-123",
          title: "Introduction to Fractions",
          keyStage: "KS2",
          subject: "Mathematics",
          topic: "Fractions",
          learningOutcome: "Students will understand basic fraction concepts",
        },
      },
      docType: "additional-glossary",
      generation: {
        lessonTitle: "Introduction to Fractions",
        glossary: [
          {
            term: "Fraction",
            definition:
              "A number that represents part of a whole. Written as one number above another, separated by a line.",
          },
          {
            term: "Numerator",
            definition:
              "The top number in a fraction. It tells you how many parts you have.",
          },
          {
            term: "Denominator",
            definition:
              "The bottom number in a fraction. It tells you how many equal parts the whole is divided into.",
          },
          {
            term: "Whole",
            definition:
              "The complete object or amount before it is divided into parts.",
          },
          {
            term: "Equal Parts",
            definition:
              "Parts that are exactly the same size when something is divided.",
          },
          {
            term: "Half",
            definition: "One of two equal parts. Written as 1/2.",
          },
          {
            term: "Quarter",
            definition: "One of four equal parts. Written as 1/4.",
          },
          {
            term: "Third",
            definition: "One of three equal parts. Written as 1/3.",
          },
          {
            term: "Unit Fraction",
            definition:
              "A fraction where the numerator is 1, such as 1/2, 1/3, or 1/4.",
          },
          {
            term: "Equivalent Fractions",
            definition:
              "Different fractions that represent the same amount, such as 1/2 and 2/4.",
          },
        ],
      },
    },
  },
  decorators: [
    (Story: React.ComponentType) => (
      <DemoProvider>
        <TeachingMaterialsLayout
          title="Introduction to Fractions"
          subTitle="Year 4 • Mathematics"
          step={4}
          docTypeName="Glossary"
        >
          <Story />
        </TeachingMaterialsLayout>
      </DemoProvider>
    ),
  ],
};

// Stories covering the Modify button functionality

export const WithModifyOptions: Story = {
  args: {
    handleRefineMaterial: (_refinementValue: RefinementOption) => {
      return Promise.resolve();
    },
  },
  parameters: {
    resourcesStoreState: {
      pageData: {
        lessonPlan: {
          lessonId: "lesson-123",
          title: "Introduction to Fractions",
          keyStage: "KS2",
          subject: "Mathematics",
          topic: "Fractions",
          learningOutcome: "Students will understand basic fraction concepts",
        },
      },
      docType: "additional-starter-quiz",
      generation: {
        year: "Year 4",
        subject: "Mathematics",
        title: "Introduction to Fractions - Starter Quiz",
        questions: [
          {
            question: "What is a fraction?",
            options: [
              { text: "A whole number", isCorrect: false },
              { text: "A part of a whole", isCorrect: true },
              { text: "A decimal number", isCorrect: false },
            ],
          },
          {
            question: "In the fraction 1/4, what does the number 4 represent?",
            options: [
              { text: "The numerator", isCorrect: false },
              { text: "The denominator", isCorrect: true },
              { text: "The whole number", isCorrect: false },
            ],
          },
          {
            question: "Which fraction represents half?",
            options: [
              { text: "1/4", isCorrect: false },
              { text: "1/2", isCorrect: true },
              { text: "1/3", isCorrect: false },
            ],
          },
          {
            question: "What does the numerator tell us?",
            options: [
              { text: "How many parts we have", isCorrect: true },
              {
                text: "How many equal parts the whole is divided into",
                isCorrect: false,
              },
              { text: "The size of each part", isCorrect: false },
            ],
          },
          {
            question: "Which is larger: 1/2 or 1/3?",
            options: [
              { text: "1/2", isCorrect: true },
              { text: "1/3", isCorrect: false },
              { text: "They are equal", isCorrect: false },
            ],
          },
          {
            question: "What is 1/4 + 1/4?",
            options: [
              { text: "1/8", isCorrect: false },
              { text: "2/4 or 1/2", isCorrect: true },
              { text: "1/2", isCorrect: false },
            ],
          },
          {
            question: "In the fraction 3/5, what is the numerator?",
            options: [
              { text: "3", isCorrect: true },
              { text: "5", isCorrect: false },
              { text: "8", isCorrect: false },
            ],
          },
          {
            question: "How many quarters make a whole?",
            options: [
              { text: "2", isCorrect: false },
              { text: "3", isCorrect: false },
              { text: "4", isCorrect: true },
            ],
          },
          {
            question: "Which fraction is equivalent to 2/4?",
            options: [
              { text: "1/2", isCorrect: true },
              { text: "1/4", isCorrect: false },
              { text: "3/4", isCorrect: false },
            ],
          },
          {
            question:
              "What fraction of this shape is shaded if 3 out of 6 parts are coloured?",
            options: [
              { text: "3/6 or 1/2", isCorrect: true },
              { text: "6/3", isCorrect: false },
              { text: "3/3", isCorrect: false },
            ],
          },
        ],
      },
    },
  },
  decorators: [
    (Story: React.ComponentType) => (
      <DemoProvider>
        <TeachingMaterialsLayout
          title="Introduction to Fractions"
          subTitle="Year 4 • Mathematics"
          step={4}
          docTypeName="Starter Quiz"
        >
          <Story />
        </TeachingMaterialsLayout>
      </DemoProvider>
    ),
  ],
};

export const LoadingState: Story = {
  args: {
    handleRefineMaterial: (_refinementValue: RefinementOption) => {
      return Promise.resolve();
    },
  },
  parameters: {
    resourcesStoreState: {
      pageData: {
        lessonPlan: {
          lessonId: "lesson-123",
          title: "Introduction to Fractions",
          keyStage: "KS2",
          subject: "Mathematics",
          topic: "Fractions",
          learningOutcome: "Students will understand basic fraction concepts",
        },
      },
      docType: "additional-starter-quiz",
      generation: null,
      isResourcesLoading: true,
    },
  },
  decorators: [
    (Story: React.ComponentType) => (
      <DemoProvider>
        <TeachingMaterialsLayout
          title="Introduction to Fractions"
          subTitle="Year 4 • Mathematics"
          step={4}
          docTypeName="Starter Quiz"
        >
          <Story />
        </TeachingMaterialsLayout>
      </DemoProvider>
    ),
  ],
};

export const RefiningState: Story = {
  args: {
    handleRefineMaterial: (_refinementValue: RefinementOption) => {
      return Promise.resolve();
    },
  },
  parameters: {
    resourcesStoreState: {
      pageData: {
        lessonPlan: {
          lessonId: "lesson-123",
          title: "Introduction to Fractions",
          keyStage: "KS2",
          subject: "Mathematics",
          topic: "Fractions",
          learningOutcome: "Students will understand basic fraction concepts",
        },
      },
      docType: "additional-starter-quiz",
      generation: {
        year: "Year 4",
        subject: "Mathematics",
        title: "Introduction to Fractions - Starter Quiz",
        questions: [
          {
            question: "What is a fraction?",
            options: [
              { text: "A whole number", isCorrect: false },
              { text: "A part of a whole", isCorrect: true },
              { text: "A decimal number", isCorrect: false },
            ],
          },
          {
            question: "In the fraction 1/4, what does the number 4 represent?",
            options: [
              { text: "The numerator", isCorrect: false },
              { text: "The denominator", isCorrect: true },
              { text: "The whole number", isCorrect: false },
            ],
          },
          {
            question: "Which fraction represents half?",
            options: [
              { text: "1/4", isCorrect: false },
              { text: "1/2", isCorrect: true },
              { text: "1/3", isCorrect: false },
            ],
          },
          {
            question: "What does the numerator tell us?",
            options: [
              { text: "How many parts we have", isCorrect: true },
              {
                text: "How many equal parts the whole is divided into",
                isCorrect: false,
              },
              { text: "The size of each part", isCorrect: false },
            ],
          },
          {
            question: "Which is larger: 1/2 or 1/3?",
            options: [
              { text: "1/2", isCorrect: true },
              { text: "1/3", isCorrect: false },
              { text: "They are equal", isCorrect: false },
            ],
          },
          {
            question: "What is 1/4 + 1/4?",
            options: [
              { text: "1/8", isCorrect: false },
              { text: "2/4 or 1/2", isCorrect: true },
              { text: "1/2", isCorrect: false },
            ],
          },
          {
            question: "In the fraction 3/5, what is the numerator?",
            options: [
              { text: "3", isCorrect: true },
              { text: "5", isCorrect: false },
              { text: "8", isCorrect: false },
            ],
          },
          {
            question: "How many quarters make a whole?",
            options: [
              { text: "2", isCorrect: false },
              { text: "3", isCorrect: false },
              { text: "4", isCorrect: true },
            ],
          },
          {
            question: "Which fraction is equivalent to 2/4?",
            options: [
              { text: "1/2", isCorrect: true },
              { text: "1/4", isCorrect: false },
              { text: "3/4", isCorrect: false },
            ],
          },
          {
            question:
              "What fraction of this shape is shaded if 3 out of 6 parts are coloured?",
            options: [
              { text: "3/6 or 1/2", isCorrect: true },
              { text: "6/3", isCorrect: false },
              { text: "3/3", isCorrect: false },
            ],
          },
        ],
      },
      isResourceRefining: true,
      refinementGenerationHistory: [
        {
          year: "Year 4",
          subject: "Mathematics",
          title: "Introduction to Fractions - Starter Quiz (Original)",
          questions: [
            {
              question: "What is a fraction?",
              options: [
                { text: "A whole number", isCorrect: false },
                { text: "A part of a whole", isCorrect: true },
                { text: "A decimal number", isCorrect: false },
              ],
            },
            {
              question: "Which fraction represents half?",
              options: [
                { text: "1/4", isCorrect: false },
                { text: "1/2", isCorrect: true },
                { text: "1/3", isCorrect: false },
              ],
            },
            {
              question: "What is the numerator in 2/3?",
              options: [
                { text: "2", isCorrect: true },
                { text: "3", isCorrect: false },
                { text: "5", isCorrect: false },
              ],
            },
            {
              question: "How many equal parts are in a quarter?",
              options: [
                { text: "2", isCorrect: false },
                { text: "3", isCorrect: false },
                { text: "4", isCorrect: true },
              ],
            },
            {
              question: "Which is smaller: 1/3 or 1/5?",
              options: [
                { text: "1/3", isCorrect: false },
                { text: "1/5", isCorrect: true },
                { text: "They are equal", isCorrect: false },
              ],
            },
            {
              question: "What fraction shows three out of four parts?",
              options: [
                { text: "3/4", isCorrect: true },
                { text: "4/3", isCorrect: false },
                { text: "1/4", isCorrect: false },
              ],
            },
            {
              question: "In 5/8, what does 8 represent?",
              options: [
                { text: "Parts we have", isCorrect: false },
                { text: "Total equal parts", isCorrect: true },
                { text: "The whole number", isCorrect: false },
              ],
            },
            {
              question: "Which fraction is closest to 1 whole?",
              options: [
                { text: "1/2", isCorrect: false },
                { text: "3/4", isCorrect: false },
                { text: "9/10", isCorrect: true },
              ],
            },
            {
              question: "What is 1/2 + 1/2?",
              options: [
                { text: "1/4", isCorrect: false },
                { text: "1", isCorrect: true },
                { text: "2/2", isCorrect: false },
              ],
            },
            {
              question: "Which fraction represents zero parts?",
              options: [
                { text: "0/4", isCorrect: true },
                { text: "4/0", isCorrect: false },
                { text: "1/4", isCorrect: false },
              ],
            },
          ],
        },
      ],
    },
  },
  decorators: [
    (Story: React.ComponentType) => (
      <DemoProvider>
        <TeachingMaterialsLayout
          title="Introduction to Fractions"
          subTitle="Year 4 • Mathematics"
          step={4}
          docTypeName="Starter Quiz"
        >
          <Story />
        </TeachingMaterialsLayout>
      </DemoProvider>
    ),
  ],
};

export const WithRefinementHistory: Story = {
  args: {
    handleRefineMaterial: (_refinementValue: RefinementOption) => {
      return Promise.resolve();
    },
  },
  parameters: {
    resourcesStoreState: {
      pageData: {
        lessonPlan: {
          lessonId: "lesson-123",
          title: "Introduction to Fractions",
          keyStage: "KS2",
          subject: "Mathematics",
          topic: "Fractions",
          learningOutcome: "Students will understand basic fraction concepts",
        },
      },
      docType: "additional-starter-quiz",
      generation: {
        year: "Year 4",
        subject: "Mathematics",
        title: "Introduction to Fractions - Starter Quiz (Refined)",
        questions: [
          {
            question: "What is a fraction?",
            options: [
              { text: "A whole number", isCorrect: false },
              { text: "A part of a whole", isCorrect: true },
              { text: "A decimal number", isCorrect: false },
            ],
          },
          {
            question: "In the fraction 1/4, what does the number 4 represent?",
            options: [
              { text: "The numerator", isCorrect: false },
              { text: "The denominator", isCorrect: true },
              { text: "The whole number", isCorrect: false },
            ],
          },
          {
            question: "Which fraction represents half?",
            options: [
              { text: "1/4", isCorrect: false },
              { text: "1/2", isCorrect: true },
              { text: "1/3", isCorrect: false },
            ],
          },
          {
            question: "What does the numerator tell us?",
            options: [
              { text: "How many parts we have", isCorrect: true },
              {
                text: "How many equal parts the whole is divided into",
                isCorrect: false,
              },
              { text: "The size of each part", isCorrect: false },
            ],
          },
          {
            question: "Which is larger: 1/2 or 1/3?",
            options: [
              { text: "1/2", isCorrect: true },
              { text: "1/3", isCorrect: false },
              { text: "They are equal", isCorrect: false },
            ],
          },
          {
            question: "What is 1/4 + 1/4?",
            options: [
              { text: "1/8", isCorrect: false },
              { text: "2/4 or 1/2", isCorrect: true },
              { text: "1/2", isCorrect: false },
            ],
          },
          {
            question: "In the fraction 3/5, what is the numerator?",
            options: [
              { text: "3", isCorrect: true },
              { text: "5", isCorrect: false },
              { text: "8", isCorrect: false },
            ],
          },
          {
            question: "How many quarters make a whole?",
            options: [
              { text: "2", isCorrect: false },
              { text: "3", isCorrect: false },
              { text: "4", isCorrect: true },
            ],
          },
          {
            question: "Which fraction is equivalent to 2/4?",
            options: [
              { text: "1/2", isCorrect: true },
              { text: "1/4", isCorrect: false },
              { text: "3/4", isCorrect: false },
            ],
          },
          {
            question:
              "What fraction of this shape is shaded if 3 out of 6 parts are coloured?",
            options: [
              { text: "3/6 or 1/2", isCorrect: true },
              { text: "6/3", isCorrect: false },
              { text: "3/3", isCorrect: false },
            ],
          },
        ],
      },
      refinementGenerationHistory: [
        {
          year: "Year 4",
          subject: "Mathematics",
          title: "Introduction to Fractions - Starter Quiz (First Refinement)",
          questions: [
            {
              question: "What is a fraction?",
              options: [
                { text: "A whole number", isCorrect: false },
                { text: "A part of a whole", isCorrect: true },
                { text: "A decimal number", isCorrect: false },
              ],
            },
            {
              question: "Which fraction represents half?",
              options: [
                { text: "1/4", isCorrect: false },
                { text: "1/2", isCorrect: true },
                { text: "1/3", isCorrect: false },
              ],
            },
            {
              question: "What is the numerator in 2/3?",
              options: [
                { text: "2", isCorrect: true },
                { text: "3", isCorrect: false },
                { text: "5", isCorrect: false },
              ],
            },
            {
              question: "How many equal parts are in a quarter?",
              options: [
                { text: "2", isCorrect: false },
                { text: "3", isCorrect: false },
                { text: "4", isCorrect: true },
              ],
            },
            {
              question: "Which is smaller: 1/3 or 1/5?",
              options: [
                { text: "1/3", isCorrect: false },
                { text: "1/5", isCorrect: true },
                { text: "They are equal", isCorrect: false },
              ],
            },
            {
              question: "What fraction shows three out of four parts?",
              options: [
                { text: "3/4", isCorrect: true },
                { text: "4/3", isCorrect: false },
                { text: "1/4", isCorrect: false },
              ],
            },
            {
              question: "In 5/8, what does 8 represent?",
              options: [
                { text: "Parts we have", isCorrect: false },
                { text: "Total equal parts", isCorrect: true },
                { text: "The whole number", isCorrect: false },
              ],
            },
            {
              question: "Which fraction is closest to 1 whole?",
              options: [
                { text: "1/2", isCorrect: false },
                { text: "3/4", isCorrect: false },
                { text: "9/10", isCorrect: true },
              ],
            },
            {
              question: "What is 1/2 + 1/2?",
              options: [
                { text: "1/4", isCorrect: false },
                { text: "1", isCorrect: true },
                { text: "2/2", isCorrect: false },
              ],
            },
            {
              question: "Which fraction represents zero parts?",
              options: [
                { text: "0/4", isCorrect: true },
                { text: "4/0", isCorrect: false },
                { text: "1/4", isCorrect: false },
              ],
            },
          ],
        },
      ],
    },
  },
  decorators: [
    (Story: React.ComponentType) => (
      <DemoProvider>
        <TeachingMaterialsLayout
          title="Introduction to Fractions"
          subTitle="Year 4 • Mathematics"
          step={4}
          docTypeName="Starter Quiz"
        >
          <Story />
        </TeachingMaterialsLayout>
      </DemoProvider>
    ),
  ],
};

// Keep Default for backwards compatibility
export const Default: Story = StarterQuiz;
