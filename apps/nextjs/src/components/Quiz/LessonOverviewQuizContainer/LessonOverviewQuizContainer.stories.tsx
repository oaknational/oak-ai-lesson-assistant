import type { Meta, StoryObj } from "@storybook/react";
import {
  type RawQuiz,
} from "@oakai/aila/src/protocol/schemas/quiz/rawQuiz";
import { convertRawQuizToV2 } from "@oakai/aila/src/protocol/schemas/quiz/conversion/rawQuizIngest";
import { chromaticParams } from "@/storybook/chromatic";

import { LessonOverviewQuizContainer } from "./LessonOverviewQuizContainer";

const fullQuizFixture: NonNullable<RawQuiz> = [
  {
    "hint": "Think about the words increase and decrease. You could think of adding and subtracting.",
    "active": false,
    "answers": {
      "short-answer": [
        {
          "answer": [
            {
              "text": "8",
              "type": "text"
            }
          ],
          "answer_is_default": true
        },
        {
          "answer": [
            {
              "text": "eight",
              "type": "text"
            }
          ],
          "answer_is_default": false
        }
      ]
    },
    "feedback": "Yes, adjacent multiples have a difference of 8.",
    "questionId": 229205,
    "questionUid": "QUES-BPWF2-29205",
    "questionStem": [
      {
        "text": "Adjacent multiples of 8 can be found by increasing or decreasing a multiple by {{ }}.",
        "type": "text"
      }
    ],
    "questionType": "short-answer"
  },
  {
    "hint": "Adjacent multiples of 8 have a difference of 8. Which numbers have a difference of 8 when compared to 40?",
    "active": false,
    "answers": {
      "multiple-choice": [
        {
          "answer": [
            {
              "text": "34",
              "type": "text"
            }
          ],
          "answer_is_correct": false
        },
        {
          "answer": [
            {
              "text": "32",
              "type": "text"
            }
          ],
          "answer_is_correct": true
        },
        {
          "answer": [
            {
              "text": "50",
              "type": "text"
            }
          ],
          "answer_is_correct": false
        },
        {
          "answer": [
            {
              "text": "48",
              "type": "text"
            }
          ],
          "answer_is_correct": true
        }
      ]
    },
    "feedback": "Yes, multiples of 8 which are adjacent to 40 are 32 and 48.",
    "questionId": 229206,
    "questionUid": "QUES-BPWF2-29206",
    "questionStem": [
      {
        "text": "Which of these are adjacent multiples of 8 to 40?",
        "type": "text"
      }
    ],
    "questionType": "multiple-choice"
  },
  {
    "hint": "Match the word to its correct mathematical symbol.",
    "active": false,
    "answers": {
      "match": [
        {
          "match_option": [
            {
              "text": "Addition",
              "type": "text"
            }
          ],
          "correct_choice": [
            {
              "text": "+",
              "type": "text"
            }
          ]
        },
        {
          "match_option": [
            {
              "text": "Subtraction",
              "type": "text"
            }
          ],
          "correct_choice": [
            {
              "text": "-",
              "type": "text"
            }
          ]
        }
      ]
    },
    "feedback": "Well done! Addition uses + and subtraction uses -.",
    "questionId": 229207,
    "questionUid": "QUES-BPWF2-29207",
    "questionStem": [
      {
        "text": "Match the mathematical operation to its symbol:",
        "type": "text"
      }
    ],
    "questionType": "match"
  },
  {
    "hint": "Put these steps in the correct order for solving an equation.",
    "active": false,
    "answers": {
      "order": [
        {
          "answer": [
            {
              "text": "Isolate the variable",
              "type": "text"
            }
          ],
          "correct_order": 2
        },
        {
          "answer": [
            {
              "text": "Identify the equation",
              "type": "text"
            }
          ],
          "correct_order": 1
        },
        {
          "answer": [
            {
              "text": "Check your answer",
              "type": "text"
            }
          ],
          "correct_order": 3
        }
      ]
    },
    "feedback": "Correct! The proper order is: identify, isolate, check.",
    "questionId": 229208,
    "questionUid": "QUES-BPWF2-29208",
    "questionStem": [
      {
        "text": "Put these equation-solving steps in the correct order:",
        "type": "text"
      }
    ],
    "questionType": "order"
  }
];

const quizWithImagesFixture: NonNullable<RawQuiz> = [
  {
    "hint": "Look at the diagram carefully.",
    "active": false,
    "answers": {
      "multiple-choice": [
        {
          "answer": [
            {
              "text": "Triangle",
              "type": "text"
            }
          ],
          "answer_is_correct": true
        },
        {
          "answer": [
            {
              "text": "Circle",
              "type": "text"
            }
          ],
          "answer_is_correct": false
        }
      ]
    },
    "feedback": "Correct! The shape shown is a triangle.",
    "questionId": 229209,
    "questionUid": "QUES-BPWF2-29209",
    "questionStem": [
      {
        "text": "What shape is shown in the diagram?",
        "type": "text"
      },
      {
        "type": "image",
        "image_object": {
          "secure_url": "https://images.unsplash.com/photo-1611696798014-07e00b2d3b1e?w=400&h=300",
          "url": "https://images.unsplash.com/photo-1611696798014-07e00b2d3b1e?w=400&h=300",
          "width": 400,
          "height": 300,
          "format": "jpg",
          "metadata": {
            "attribution": "Photo by Antoine Dautry on Unsplash",
            "usageRestriction": "Creative Commons"
          },
          "public_id": "triangle_diagram",
          "version": 1
        }
      }
    ],
    "questionType": "multiple-choice"
  },
  {
    "hint": "Count the objects in the image.",
    "active": false,
    "answers": {
      "short-answer": [
        {
          "answer": [
            {
              "text": "5",
              "type": "text"
            }
          ],
          "answer_is_default": true
        }
      ]
    },
    "feedback": "Yes, there are 5 objects in the image.",
    "questionId": 229210,
    "questionUid": "QUES-BPWF2-29210",
    "questionStem": [
      {
        "text": "How many objects are shown?",
        "type": "text"
      },
      {
        "type": "image",
        "image_object": {
          "secure_url": "https://images.unsplash.com/photo-1509909756405-be0199881695?w=400&h=300",
          "url": "https://images.unsplash.com/photo-1509909756405-be0199881695?w=400&h=300",
          "width": 400,
          "height": 300,
          "format": "jpg",
          "metadata": {
            "attribution": "Photo by Michał Parzuchowski on Unsplash"
          },
          "public_id": "counting_objects",
          "version": 1
        }
      }
    ],
    "questionType": "short-answer"
  }
];

const meta: Meta<typeof LessonOverviewQuizContainer> = {
  title: "Components/Quiz/LessonOverviewQuizContainer",
  component: LessonOverviewQuizContainer,
  parameters: {
    layout: "padded",
    ...chromaticParams(["mobile", "desktop"]),
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const AllQuestionTypes: Story = {
  args: {
    quiz: convertRawQuizToV2(fullQuizFixture),
    isMathJaxLesson: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Shows all supported question types: short-answer, multiple-choice, match, and order questions."
      }
    }
  }
};

export const WithImageAttributions: Story = {
  args: {
    quiz: convertRawQuizToV2(quizWithImagesFixture),
    isMathJaxLesson: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Demonstrates how image attributions are automatically extracted from images and displayed. Check the console for attribution extraction."
      }
    }
  }
};

export const EmptyQuiz: Story = {
  args: {
    quiz: { version: "v2", questions: [] },
    isMathJaxLesson: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Shows the container behavior when no questions are provided."
      }
    }
  }
};