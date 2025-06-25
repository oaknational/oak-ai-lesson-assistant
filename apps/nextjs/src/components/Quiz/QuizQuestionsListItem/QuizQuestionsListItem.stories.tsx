import type { Meta, StoryObj } from "@storybook/react";
import type { QuizV2Question } from "@oakai/aila/src/protocol/schemas";
import { chromaticParams } from "@/storybook/chromatic";

import { QuizQuestionsListItem } from "./QuizQuestionsListItem";

const multipleChoiceQuestion: QuizV2Question = {
  questionType: "multiple-choice",
  questionStem: [
    { type: "text", text: "What is 2 + 2?" }
  ],
  answers: [
    [{ type: "text", text: "4" }]
  ],
  distractors: [
    [{ type: "text", text: "3" }],
    [{ type: "text", text: "5" }],
    [{ type: "text", text: "6" }]
  ],
  feedback: "Correct! 2 + 2 = 4",
  hint: "Think about basic addition"
};

const shortAnswerQuestion: QuizV2Question = {
  questionType: "short-answer",
  questionStem: [
    { type: "text", text: "What is the capital of France?" }
  ],
  answers: [
    [{ type: "text", text: "Paris" }],
    [{ type: "text", text: "paris" }]
  ],
  feedback: "Correct! Paris is the capital of France.",
  hint: "It's known as the City of Light"
};

const matchQuestion: QuizV2Question = {
  questionType: "match",
  questionStem: [
    { type: "text", text: "Match the animals to their sounds:" }
  ],
  pairs: [
    {
      left: [{ type: "text", text: "Dog" }],
      right: [{ type: "text", text: "Bark" }]
    },
    {
      left: [{ type: "text", text: "Cat" }],
      right: [{ type: "text", text: "Meow" }]
    },
    {
      left: [{ type: "text", text: "Cow" }],
      right: [{ type: "text", text: "Moo" }]
    }
  ],
  feedback: "Great job matching the animals to their sounds!",
  hint: "Think about what sounds these animals make"
};

const orderQuestion: QuizV2Question = {
  questionType: "order",
  questionStem: [
    { type: "text", text: "Put these numbers in ascending order:" }
  ],
  items: [
    [{ type: "text", text: "1" }],
    [{ type: "text", text: "3" }],
    [{ type: "text", text: "5" }],
    [{ type: "text", text: "7" }]
  ],
  feedback: "Perfect! You've ordered them correctly: 1, 3, 5, 7",
  hint: "Start with the smallest number"
};

const explanatoryTextQuestion: QuizV2Question = {
  questionType: "explanatory-text",
  questionStem: [
    { type: "text", text: "Remember: When adding fractions, you need a common denominator first." }
  ],
  content: [
    { type: "text", text: "This is important information for the next section on fraction arithmetic." }
  ]
};

const richContentQuestion: QuizV2Question = {
  questionType: "multiple-choice",
  questionStem: [
    { type: "text", text: "What shape is shown below?" },
    { 
      type: "image", 
      image: { 
        url: "https://images.unsplash.com/photo-1611696798014-07e00b2d3b1e?w=200&h=150",
        width: 200,
        height: 150,
        attribution: "Photo by Antoine Dautry on Unsplash"
      } 
    }
  ],
  answers: [
    [{ type: "text", text: "Triangle" }]
  ],
  distractors: [
    [
      { type: "text", text: "Square " },
      { 
        type: "image", 
        image: { 
          url: "https://images.unsplash.com/photo-1509909756405-be0199881695?w=100&h=100",
          width: 100,
          height: 100
        } 
      }
    ],
    [{ type: "text", text: "Circle" }]
  ],
  feedback: "Correct! The image shows a triangle.",
  hint: "Count the sides and corners"
};

const meta: Meta<typeof QuizQuestionsListItem> = {
  title: "Components/Quiz/QuizQuestionsListItem",
  component: QuizQuestionsListItem,
  parameters: {
    layout: "padded",
    ...chromaticParams(["mobile", "desktop"]),
  },
  argTypes: {
    index: {
      control: "number",
      description: "Question number (0-indexed)",
    },
    isMathJaxLesson: {
      control: "boolean",
      description: "Whether to enable MathJax rendering",
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const MultipleChoice: Story = {
  args: {
    question: multipleChoiceQuestion,
    index: 0,
    isMathJaxLesson: true,
  },
  parameters: {
    docs: {
      description: {
        story: "A multiple choice question with one correct answer and multiple distractors."
      }
    }
  }
};

export const ShortAnswer: Story = {
  args: {
    question: shortAnswerQuestion,
    index: 0,
    isMathJaxLesson: true,
  },
  parameters: {
    docs: {
      description: {
        story: "A short answer question with multiple acceptable answers."
      }
    }
  }
};

export const Match: Story = {
  args: {
    question: matchQuestion,
    index: 0,
    isMathJaxLesson: true,
  },
  parameters: {
    docs: {
      description: {
        story: "A matching question where students pair left and right items."
      }
    }
  }
};

export const Order: Story = {
  args: {
    question: orderQuestion,
    index: 0,
    isMathJaxLesson: true,
  },
  parameters: {
    docs: {
      description: {
        story: "An ordering question where students arrange items in the correct sequence."
      }
    }
  }
};

export const ExplanatoryText: Story = {
  args: {
    question: explanatoryTextQuestion,
    index: 0,
    isMathJaxLesson: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Explanatory text that provides information without requiring an answer."
      }
    }
  }
};

export const RichContentWithImages: Story = {
  args: {
    question: richContentQuestion,
    index: 0,
    isMathJaxLesson: true,
  },
  parameters: {
    docs: {
      description: {
        story: "A question with rich content including both text and images in the question stem and answer choices."
      }
    }
  }
};