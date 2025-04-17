/**
 *
 * These fixtures follow the new schema implemented by pupil squad.
 * This follows the database schema as closely as possible but translates all fields to camelCase.
 *
 */
import type {
  ImageItem,
  ImageOrTextItem,
  MCAnswer,
  MatchAnswer,
  OrderAnswer,
  QuizQuestion,
  ShortAnswer,
} from "./quizTypes";

export const imageObject: ImageItem["imageObject"] = {
  format: "jpg",
  url: "http://oaknationalacademy-res.cloudinary.com/image/upload/v1687374653/Trees.jpg",
  secureUrl:
    "https://oaknationalacademy-res.cloudinary.com/image/upload/v1687374653/Trees.jpg",
  width: 1280,
  height: 852,
  metadata: { attribution: "test attribution picture" },
  publicId: "Trees",
  version: 1687374653,
};

export const questionStem: ImageOrTextItem[] = [
  {
    text: "What is a main clause?",
    type: "text",
  },
];

export const questionStemWithImage: ImageOrTextItem[] = [
  {
    text: "Which of these statements about trees is true?",
    type: "text",
  },
  {
    type: "image",
    imageObject,
  },
];

export const mcqCorrectAnswer: MCAnswer = {
  answer: [
    {
      text: "a group of words that contains a verb and makes complete sense",
      type: "text",
    },
  ],
  answerIsCorrect: true,
};

export const mcqIncorrectAnswer: MCAnswer = {
  answer: [
    {
      text: "a sentence starter followed by a comma",
      type: "text",
    },
  ],
  answerIsCorrect: false,
};

export const mcqTextAnswers: MCAnswer[] = [
  mcqIncorrectAnswer,
  {
    answer: [
      {
        text: "a group of letters",
        type: "text",
      },
    ],
    answerIsCorrect: false,
  },
  mcqCorrectAnswer,
  {
    answer: [
      {
        text: "a word that joins",
        type: "text",
      },
    ],
    answerIsCorrect: false,
  },
];

export const mcqImageAnswers: MCAnswer[] = [
  {
    answer: [
      {
        type: "image",
        imageObject,
      },
      {
        text: "Trees grow from seeds.",
        type: "text",
      },
    ],
    answerIsCorrect: true,
  },
  {
    answer: [
      {
        type: "image",
        imageObject,
      },
      {
        text: "Trees grow from something different to seeds.",
        type: "text",
      },
    ],
    answerIsCorrect: false,
  },
  {
    answer: [
      {
        type: "image",
        imageObject,
      },
      {
        text: "Trees are put in the ground by people.",
        type: "text",
      },
    ],
    answerIsCorrect: false,
  },
];

export const shortAnswers: ShortAnswer[] = [
  {
    answer: [{ text: "earth", type: "text" }],
    answerIsDefault: true,
  },
  {
    answer: [{ text: "wind", type: "text" }],
    answerIsDefault: false,
  },
  {
    answer: [{ text: "fire", type: "text" }],
    answerIsDefault: false,
  },
];

export const orderAnswers: OrderAnswer[] = [
  {
    answer: [
      {
        text: "Edward the Confessor was exiled in Normandy.",
        type: "text",
      },
    ],
    correctOrder: 1,
  },
  {
    answer: [{ text: "Edward the Confessor became king.", type: "text" }],
    correctOrder: 2,
  },
  {
    answer: [
      {
        text: "Harold Godwinson travelled to Normandy.",
        type: "text",
      },
    ],
    correctOrder: 3,
  },
  {
    answer: [{ text: "Edward the Confessor died.", type: "text" }],
    correctOrder: 4,
  },
];

export const matchAnswers: MatchAnswer[] = [
  {
    correctChoice: [{ text: "producer", type: "text" }],
    matchOption: [{ text: "grass", type: "text" }],
  },
  {
    correctChoice: [{ text: "primary consumer", type: "text" }],
    matchOption: [{ text: "cow", type: "text" }],
  },
  {
    correctChoice: [{ text: "secondary consumer", type: "text" }],
    matchOption: [{ text: "human", type: "text" }],
  },
];

export const quizQuestions: NonNullable<QuizQuestion>[] = [
  {
    hint: "Main clause is the most powerful of the clauses.",
    active: false,
    questionStem,
    answers: {
      "multiple-choice": mcqTextAnswers,
    },
    feedback: "Correct! A main clause can form a simple sentence by itself.",
    questionId: 985,
    questionUid: "QUES-EKUYT-EE985",

    questionType: "multiple-choice",
    order: 1,
  },
  {
    hint: "A Horse chestnut tree grows from a conker.",
    active: false,
    answers: {
      "multiple-choice": [
        {
          answer: [
            {
              text: "Trees grow from seeds.",
              type: "text",
            },
          ],
          answerIsCorrect: true,
        },
        {
          answer: [
            {
              text: "Trees grow from something different to seeds.",
              type: "text",
            },
          ],
          answerIsCorrect: false,
        },
        {
          answer: [
            {
              text: "Trees are put in the ground by people.",
              type: "text",
            },
          ],
          answerIsCorrect: false,
        },
      ],
    },
    feedback: "Correct! Trees do grow from seeds.",
    questionId: 20,
    questionUid: "QUES-CKPSN-KFF20",
    questionStem: questionStemWithImage,
    questionType: "multiple-choice",
    order: 2,
  },
  {
    hint: "A Horse chestnut tree grows from a conker.",
    active: false,
    answers: {
      "multiple-choice": mcqImageAnswers,
    },
    feedback: "Correct! Trees do grow from seeds.",
    questionId: 20,
    questionUid: "QUES-CKPSN-KFF20",
    questionStem: [
      {
        text: "Which of these statements about trees is true?",
        type: "text",
      },
    ],
    questionType: "multiple-choice",
    order: 3,
  },
  {
    hint: "A Horse chestnut tree grows from a conker.",
    active: false,
    answers: {
      match: matchAnswers,
    },
    feedback: "Correct! Trees do grow from seeds.",
    questionId: 20,
    questionUid: "QUES-CKPSN-KFF20",
    questionStem: [
      {
        text: "Match each organism from the food chain to the correct term used to describe it.",
        type: "text",
      },
    ],
    questionType: "match",
    order: 4,
  },
  {
    hint: "A Horse chestnut tree grows from a conker.",
    active: false,
    questionStem: [
      {
        text: "Put the following events in the order in which they happened, according to William of Poitiers. Start with the earliest event.",
        type: "text",
      },
    ],
    answers: {
      order: orderAnswers,
    },
    feedback: "Correct! Trees do grow from seeds.",
    questionId: 20,
    questionUid: "QUES-CKPSN-KFF20",

    questionType: "order",
    order: 5,
  },
  {
    hint: "A Horse chestnut tree grows from a conker.",
    active: false,
    answers: {
      "short-answer": shortAnswers,
    },
    feedback: "Correct! Trees do grow from seeds.",
    questionId: 20,
    questionUid: "QUES-CKPSN-KFF20",
    questionStem: [
      {
        text: "When the roots push out of the seed, they grow down into the soil 'searching' for {{}}.",
        type: "text",
      },
    ],
    questionType: "short-answer",
    order: 6,
  },
];

export const quizQuestionsNoImages: QuizQuestion[] = [
  {
    hint: "Main clause is the most powerful of the clauses.",
    active: false,
    questionStem,
    answers: {
      "multiple-choice": mcqTextAnswers,
    },
    feedback: "Correct! A main clause can form a simple sentence by itself.",
    questionId: 985,
    questionUid: "QUES-EKUYT-EE985",

    questionType: "multiple-choice",
    order: 1,
  },
  {
    hint: "A Horse chestnut tree grows from a conker.",
    active: false,
    answers: {
      "short-answer": shortAnswers,
    },
    feedback: "Correct! Trees do grow from seeds.",
    questionId: 20,
    questionUid: "QUES-CKPSN-KFF20",
    questionStem: [
      {
        text: "When the roots push out of the seed, they grow down into the soil 'searching' for {{}}.",
        type: "text",
      },
    ],
    questionType: "short-answer",
    order: 2,
  },
];

export const exitQuizQuestions: QuizQuestion[] = [
  {
    hint: "You need to multiply both sides of the equation by the reciprocal of $$1\\over 3$$. Check by substitution.",
    order: 1,
    active: false,
    answers: {
      "short-answer": [
        { answer: [{ text: "18", type: "text" }], answerIsDefault: true },
      ],
    },
    feedback: "$${1\\over 3}a \\times 3= 6\\times 3$$ so $$a = 18$$",
    questionId: 254009,
    questionUid: "QUES-XFKS2-54009",
    questionStem: [
      {
        text: "The solution to the equation $${1\\over 3}a = 6$$ is when $$a =$${{}}.",
        type: "text",
      },
    ],
    questionType: "short-answer",
  },
  {
    hint: "You need to maintain equality by performing the same operation to both sides, think about which order you should do the operations in. Substitute to check your answers.",
    order: 2,
    active: false,
    answers: {
      match: [
        {
          matchOption: [{ text: "$${1\\over 4}a + 3 = 10$$", type: "text" }],
          correctChoice: [{ text: "$$a = 28$$", type: "text" }],
        },
        {
          matchOption: [{ text: "$${1\\over 4}(a + 3)=10$$", type: "text" }],
          correctChoice: [{ text: "$$a = 37$$", type: "text" }],
        },
        {
          matchOption: [{ text: "$${4\\over 7} a = 1$$", type: "text" }],
          correctChoice: [{ text: "$$a = {7\\over 4}$$", type: "text" }],
        },
        {
          matchOption: [{ text: "$${7\\over 4}a=14$$", type: "text" }],
          correctChoice: [{ text: "$$a = 8$$", type: "text" }],
        },
        {
          matchOption: [{ text: "$$\\frac{a+3}{7} = 2$$", type: "text" }],
          correctChoice: [{ text: "$$a = 11$$", type: "text" }],
        },
      ],
    },
    feedback:
      "For $${1\\over 4}a + 3 = 10$$ subtracting 3 first is easier, then you can multiply by 4. For $${1\\over 4}(a + 3)=10$$ multiplying by 4 first is easier, then you can subtract 3. ",
    questionId: 254010,
    questionUid: "QUES-VCHO2-54010",
    questionStem: [
      { text: "Match each equation to its solution.", type: "text" },
    ],
    questionType: "match",
  },
  {
    hint: "$${1\\over 5}x$$ is equivalent to $$x\\over 5$$ because dividing by a number (e.g. 5) is the same as multiplying by its reciprocal $$ ({1\\over 5})$$. You can use numerical values to test whether expressions are equivalent.",
    order: 3,
    active: false,
    answers: {
      match: [
        {
          matchOption: [{ text: "$${2\\over 3}x$$", type: "text" }],
          correctChoice: [{ text: "$$2x\\over 3$$", type: "text" }],
        },
        {
          matchOption: [{ text: "$$2\\over 3x$$", type: "text" }],
          correctChoice: [{ text: "$$2({1\\over 3x})$$", type: "text" }],
        },
        {
          matchOption: [
            { text: "$${2\\over 3}\\times {1\\over 3x}$$", type: "text" },
          ],
          correctChoice: [{ text: "$$2\\over 9x$$", type: "text" }],
        },
        {
          matchOption: [{ text: "$$2x \\times {1\\over 9}$$", type: "text" }],
          correctChoice: [{ text: "$$2x\\over 9$$", type: "text" }],
        },
        {
          matchOption: [
            { text: "$${3\\over 2}\\times {1\\over x}$$", type: "text" },
          ],
          correctChoice: [{ text: "$$3\\over 2x$$", type: "text" }],
        },
      ],
    },
    feedback:
      "$$2x\\over 3$$ is equivalent to $$2\\times {x\\over 3}$$. $$ 2\\over 3x$$ is equivalent to $$2\\times {1\\over 3x}$$",
    questionId: 254011,
    questionUid: "QUES-XDNR2-54011",
    questionStem: [
      {
        text: "Match each expression to an equivalent expression.",
        type: "text",
      },
    ],
    questionType: "match",
  },
  {
    hint: "Multiply both sides of the equation by $$a$$ first. Then what is your final step to solve for $$a$$?",
    order: 4,
    active: false,
    answers: {
      "short-answer": [
        { answer: [{ text: "3", type: "text" }], answerIsDefault: true },
      ],
    },
    feedback:
      "$${6\\over a} \\times a=2\\times a$$, $$6=2a$$, therefore $$a = 3$$",
    questionId: 254012,
    questionUid: "QUES-OHFX2-54012",
    questionStem: [
      {
        text: "The solution to the equation $${6\\over a}=2$$ is when $$a = $${{}}.",
        type: "text",
      },
    ],
    questionType: "short-answer",
  },
  {
    hint: "$${4\\over 5a}=6$$ multiply both sides of the equation by $$5a$$. Then think about how to solve this new equation.",
    order: 5,
    active: false,
    answers: {
      "multiple-choice": [
        {
          answer: [{ text: "$$3\\over 10$$", type: "text" }],
          answerIsCorrect: false,
        },
        {
          answer: [{ text: "$$2\\over 15$$", type: "text" }],
          answerIsCorrect: true,
        },
        {
          answer: [{ text: "$$2\\over 25$$", type: "text" }],
          answerIsCorrect: false,
        },
        {
          answer: [{ text: "$$15\\over 2$$", type: "text" }],
          answerIsCorrect: false,
        },
        {
          answer: [{ text: "$$25\\over 2$$", type: "text" }],
          answerIsCorrect: false,
        },
      ],
    },
    feedback:
      "$${4\\over 5a}=6$$ gives $$4 = 30a$$. So $$a= {4\\over 30}$$ or $$a={2\\over 15}$$",
    questionId: 254013,
    questionUid: "QUES-RINS2-54013",
    questionStem: questionStemWithImage,
    questionType: "multiple-choice",
  },
  {
    hint: "Start by multiplying both sides of the equation by $$(a+3)$$. Make sure you use brackets where necessary.",
    order: 6,
    active: false,
    answers: {
      "multiple-choice": [
        {
          answer: [{ text: "$$-{27\\over 10}$$", type: "text" }],
          answerIsCorrect: false,
        },
        {
          answer: [{ text: "$$-{3\\over 10}$$", type: "text" }],
          answerIsCorrect: false,
        },
        {
          answer: [{ text: "$$1\\over 3$$", type: "text" }],
          answerIsCorrect: true,
        },
        {
          answer: [{ text: "$$17\\over 6$$", type: "text" }],
          answerIsCorrect: false,
        },
        {
          answer: [{ text: "$$20\\over 3$$", type: "text" }],
          answerIsCorrect: false,
        },
      ],
    },
    feedback:
      "$$20 = 6(a+3)$$, $${20\\over 6}=a+3$$, $${10\\over 3}-3=a$$. Therefore $$a={1\\over 3}$$",
    questionId: 254014,
    questionUid: "QUES-WNIR2-54014",
    questionStem: questionStemWithImage,
    questionType: "multiple-choice",
  },
  {
    hint: "A Horse chestnut tree grows from a conker.",
    active: false,
    questionStem: [
      {
        text: "Put the following events in the order in which they happened, according to William of Poitiers. Start with the earliest event.",
        type: "text",
      },
    ],
    answers: {
      order: orderAnswers,
    },
    feedback: "Correct! Trees do grow from seeds.",
    questionId: 20,
    questionUid: "QUES-CKPSN-KFF20",

    questionType: "order",
    order: 5,
  },
];
