import type { QuizV1, QuizV2, QuizV3 } from "../../quiz";

// V1 Quiz fixtures (array format)
export const mockV1Quiz: QuizV1 = [
  {
    question: "What is 2 + 2?",
    answers: ["4"],
    distractors: ["3", "5"],
  },
  {
    question: "What is the capital of France?",
    answers: ["Paris"],
    distractors: ["London", "Berlin"],
  },
];

export const mockV1QuizShort: QuizV1 = [
  {
    question: "What is 2 + 2?",
    answers: ["4"],
    distractors: ["3", "5"],
  },
];

export const mockV1EmptyQuiz: QuizV1 = [];

// V2 Quiz fixtures (object format with version)
export const mockV2Quiz: QuizV2 = {
  version: "v2",
  questions: [
    {
      questionType: "multiple-choice",
      question: "What is the capital of Spain?",
      answers: ["Madrid"],
      distractors: ["Barcelona", "Seville"],
      hint: null,
    },
  ],
  imageAttributions: [],
};

export const mockV2QuizAlt: QuizV2 = {
  version: "v2",
  questions: [
    {
      questionType: "multiple-choice",
      question: "What is the capital of Italy?",
      answers: ["Rome"],
      distractors: ["Milan", "Naples"],
      hint: null,
    },
  ],
  imageAttributions: [],
};

// V3 Quiz fixtures (object format with imageMetadata)
export const mockV3Quiz: QuizV3 = {
  version: "v3",
  questions: [
    {
      questionType: "multiple-choice",
      question: "What is the capital of Germany?",
      answers: ["Berlin"],
      distractors: ["Munich", "Hamburg"],
      hint: null,
    },
  ],
  imageMetadata: [],
};

// Base chat data structure
export const baseChatData = {
  id: "test-chat-id",
  path: "/test-path",
  title: "Test Chat",
  userId: "test-user-id",
  createdAt: Date.now(),
  messages: [],
};

// Chat fixtures with different quiz combinations
export const chatWithV1Quiz = {
  ...baseChatData,
  lessonPlan: {
    title: "Test Lesson",
    subject: "Mathematics",
    starterQuiz: mockV1Quiz,
    exitQuiz: mockV2Quiz,
  },
};

export const chatWithV2Quiz = {
  ...baseChatData,
  lessonPlan: {
    title: "Test Lesson",
    subject: "Mathematics",
    starterQuiz: mockV2Quiz,
    exitQuiz: mockV2Quiz,
  },
};

export const chatWithV3Quiz = {
  ...baseChatData,
  lessonPlan: {
    title: "Test Lesson",
    subject: "Mathematics",
    starterQuiz: mockV3Quiz,
    exitQuiz: mockV3Quiz,
  },
};

// Lesson plan fixtures
export const simpleLessonPlan = {
  title: "My Lesson",
  subject: "Mathematics",
  starterQuiz: mockV2Quiz,
  exitQuiz: mockV2Quiz,
};

export const lessonPlanWithV3Quizzes = {
  title: "My Lesson",
  subject: "Mathematics",
  starterQuiz: mockV3Quiz,
  exitQuiz: mockV3Quiz,
};

export const completeLessonPlan = {
  title: "Complete Lesson",
  keyStage: "key-stage-3",
  subject: "Mathematics",
  topic: "Algebra",
  learningOutcome: "I can solve quadratic equations",
  starterQuiz: mockV1Quiz,
  exitQuiz: mockV2Quiz,
};

export const lessonPlanWithoutQuizzes = {
  title: "Lesson without quizzes",
  subject: "Science",
};

export const lessonPlanWithUndefinedQuizzes = {
  starterQuiz: undefined,
  exitQuiz: undefined,
  title: "Test",
};

// Invalid inputs for testing error handling
export const invalidInputs: unknown[] = [
  null,
  undefined,
  "string",
  123,
  true,
  [],
];

export const invalidQuizInputs = [
  "not a quiz",
  123,
  { invalid: "structure" },
  [{ incomplete: "question" }],
];

// Invalid chat data for testing
export const invalidChatData = {
  id: "test-id",
  // missing lessonPlan
};

export const chatWithStringLessonPlan = {
  id: "test-id",
  lessonPlan: "invalid-lesson-plan",
};

export const chatWithNullLessonPlan = {
  id: "test-id",
  lessonPlan: null,
};
