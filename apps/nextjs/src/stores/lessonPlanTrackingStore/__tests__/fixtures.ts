export const messages = {
  user1: {
    role: "user",
    content: "[ ... Make me a custom lesson plan about Roman Britain ... ]",
  },
  user1RomansExample: {
    role: "user",
    content:
      "Create a lesson plan about the end of Roman Britain for key stage 3 history",
  },
  user1Inappropriate: {
    role: "User",
    content: "[ ... Do something inappropriate ... ]",
  },
  assistant1: {
    role: "assistant",
    content: "[ ... Here's a lesson about Roman Britain ... ]",
    parts: [], // Not needed for the test but the code expects an array
  },
  assistant1RagOptions: {
    role: "assistant",
    content: "[... Please pick from the following options: ... ]",
    parts: [], // Not needed for the test but the code expects an array
  },
  assistant1AccountLocked: {
    role: "assistant",
    content: "[ ... account locked ... ]",
    parts: [
      {
        document: {
          type: "action",
          action: "SHOW_ACCOUNT_LOCKED",
        },
      },
    ],
  },
  assistant1ToxicModeration: {
    role: "assistant",
    content: "[ ... response marked toxic ... ]",
    parts: [
      {
        document: {
          type: "moderation",
          categories: ["t4"],
        },
      },
    ],
  },

  user2Refinement: {
    role: "user",
    content: "Add more castles",
  },
  user2Continue: {
    role: "user",
    content: "continue",
  },
  user2Modify: {
    role: "user",
    content: "Make the learning cycles easier",
  },
  user2AdditionalMaterials: {
    role: "user",
    content: `Add a homework task to the additional materials section`,
  },
  user2SelectRagOption: {
    role: "user",
    content: "1",
  },
  assistant2Refinement: {
    role: "assistant",
    content:
      "[ ... Here's a lesson about Roman Britain with more castles ... ]",
    parts: [
      {
        document: {
          type: "patch",
          value: {
            type: "string",
            op: "replace",
            path: "/learningOutcome",
            value:
              "I understand the end of Roman Britain, in particular the castles",
          },
        },
      },
    ],
  },
  assistant2ModifyResponse: {
    role: "assistant",
    content: "[ ... I've made those changes for you ... ]",
    parts: [
      {
        document: {
          type: "patch",
          value: {
            type: "string",
            op: "replace",
            path: "/cycle1",
            value: "[Simple version of cycle 1]",
          },
        },
      },
    ],
  },
  assistant2AdditionalMaterialsResponse: {
    role: "assistant",
    content: "[ ... I've added the homework task ... ]",
    parts: [
      {
        document: {
          type: "patch",
          value: {
            type: "string",
            op: "add",
            path: "/additionalMaterials",
            value: {
              id: "additional-materials-test-id",
              title: "Homework Task",
            },
          },
        },
      },
    ],
  },
  assistant2RagResult: {
    role: "assistant",
    content: "[ ... Here's your lesson ... ]",
    parts: [
      {
        document: {
          type: "patch",
          value: {
            path: "/basedOn",
            op: "add",
            value: {
              id: "based-on-test-id",
              title: "Oak Lesson on Romans",
            },
          },
        },
      },
    ],
  },
} as const;

const lessonPlanCategorised = {
  title: "Roman Britain",
  subject: "history",
  keyStage: "key-stage-3",
};

const lessonPlanRagResult = {
  title: "Roman Britain",
  subject: "history",
  keyStage: "key-stage-3",
  basedOn: {
    id: "based-on-test-id",
    title: "Oak Lesson on Romans",
  },
};

const completedLessonPlan = {
  title: "Software Testing Techniques",
  topic: "Testing methodologies and practices",
  cycle1: {
    title: "Identifying Software Testing Techniques",
    feedback:
      "Model answer: Black-box testing is matched with 'testing based on inputs and outputs', white-box with 'testing internal structures', manual with 'checking without tools', and automated with 'using software tools'.",
    practice:
      "Match the definitions to the correct testing technique: black-box, white-box, manual, or automated.",
    explanation: {
      slideText:
        "Learn about black-box and white-box testing techniques and their roles in software testing.",
      imagePrompt: "black-box vs white-box testing diagram",
      spokenExplanation: [
        "Explain the role of software testing in ensuring application quality.",
        "Introduce black-box and white-box testing as key techniques.",
        "Define black-box testing: focuses on inputs and outputs without knowledge of internal code.",
        "Define white-box testing: involves testing internal structures of the application.",
        "Discuss manual testing: manually checking the software for defects without tools.",
        "Introduce automated testing: using software tools to execute tests automatically.",
      ],
      accompanyingSlideDetails:
        "A diagram comparing black-box and white-box testing techniques.",
    },
    durationInMinutes: 15,
    checkForUnderstanding: [
      {
        questionType: "multiple-choice" as const,
        question: "What is black-box testing?",
        answers: ["Testing based on inputs and outputs"],
        distractors: [
          "Testing internal structures",
          "Testing with software tools",
        ],
        hint: null,
      },
      {
        questionType: "multiple-choice" as const,
        question: "What does white-box testing involve?",
        answers: ["Testing internal structures"],
        distractors: ["Testing inputs and outputs", "Testing without tools"],
        hint: null,
      },
    ],
  },
  cycle2: {
    title: "Explaining Purposes of Testing Techniques",
    feedback:
      "Model answer: Black-box testing is best for testing user interfaces, white-box for code correctness, manual for exploratory tasks, and automated for repetitive tests.",
    practice:
      "Explain, in your own words, when it would be most advantageous to use each testing technique: black-box, white-box, manual, and automated.",
    explanation: {
      slideText:
        "Understand the purposes and advantages of different testing techniques.",
      imagePrompt: "testing techniques purposes table",
      spokenExplanation: [
        "Discuss the purpose of black-box testing: validating software functionality from an end-user perspective.",
        "Explain white-box testing purpose: ensuring internal code correctness and structure integrity.",
        "Introduce the advantages of manual testing: flexibility and human insight in exploratory testing.",
        "Discuss the purpose of automated testing: efficiency in repetitive test cases and regression testing.",
        "Highlight scenarios where each technique is most effective.",
      ],
      accompanyingSlideDetails:
        "A table listing testing techniques with their purposes and advantages.",
    },
    durationInMinutes: 15,
    checkForUnderstanding: [
      {
        questionType: "multiple-choice" as const,
        question: "What is the purpose of black-box testing?",
        answers: ["Validating functionality from an end-user perspective"],
        distractors: [
          "Ensuring code correctness",
          "Testing with automation tools",
        ],
        hint: null,
      },
      {
        questionType: "multiple-choice" as const,
        question: "Why is manual testing beneficial?",
        answers: ["Provides flexibility and human insight"],
        distractors: [
          "Ensures internal code correctness",
          "Automates repetitive tasks",
        ],
        hint: null,
      },
    ],
  },
  cycle3: {
    title: "Evaluating Testing Effectiveness",
    feedback:
      "Model answer: User interfaces benefit from black-box testing, code quality from white-box, usability from manual, and regression from automated testing.",
    practice:
      "Given a set of scenarios, evaluate and justify which testing technique would be most effective for each.",
    explanation: {
      slideText:
        "Evaluate the effectiveness of testing techniques in various scenarios.",
      imagePrompt: "testing scenarios evaluation",
      spokenExplanation: [
        "Present scenarios where different testing techniques are applied.",
        "Evaluate the effectiveness of black-box testing for user interface scenarios.",
        "Discuss white-box testing's effectiveness for code quality assurance.",
        "Examine manual testing's role in usability testing.",
        "Consider automated testing's efficiency in regression testing.",
      ],
      accompanyingSlideDetails:
        "Scenarios with testing techniques applied and their evaluations.",
    },
    durationInMinutes: 15,
    checkForUnderstanding: [
      {
        questionType: "multiple-choice" as const,
        question: "In which scenario is black-box testing most effective?",
        answers: ["User interface testing"],
        distractors: ["Code quality assurance", "Regression testing"],
        hint: null,
      },
      {
        questionType: "multiple-choice" as const,
        question: "Which testing is efficient for regression testing?",
        answers: ["Automated testing"],
        distractors: ["Manual testing", "Black-box testing"],
        hint: null,
      },
    ],
  },
  subject: "computing",
  exitQuiz: {
    version: "v2" as const,
    imageAttributions: [],
    questions: [
      {
        questionType: "multiple-choice" as const,
        question: "What is the main focus of black-box testing?",
        answers: ["Inputs and outputs"],
        distractors: ["Internal code", "Testing tools"],
        hint: null,
      },
      {
        questionType: "multiple-choice" as const,
        question: "Which technique involves testing internal structures?",
        answers: ["White-box testing"],
        distractors: ["Black-box testing", "Manual testing"],
        hint: null,
      },
      {
        questionType: "multiple-choice" as const,
        question: "Why is automated testing used?",
        answers: ["For efficiency in repetitive tasks"],
        distractors: ["For human insight", "For testing inputs and outputs"],
        hint: null,
      },
      {
        questionType: "multiple-choice" as const,
        question: "When is manual testing most beneficial?",
        answers: ["In exploratory tasks"],
        distractors: ["In repetitive tasks", "In regression testing"],
        hint: null,
      },
      {
        questionType: "multiple-choice" as const,
        question:
          "Which testing technique validates functionality from an end-user perspective?",
        answers: ["Black-box testing"],
        distractors: ["White-box testing", "Automated testing"],
        hint: null,
      },
      {
        questionType: "multiple-choice" as const,
        question: "What is the role of white-box testing?",
        answers: ["Ensuring code correctness"],
        distractors: ["Testing user interfaces", "Automating tasks"],
        hint: null,
      },
    ],
  },
  keyStage: "key-stage-4",
  keywords: [
    {
      keyword: "Quality assurance",
      definition:
        "A systematic process to ensure products meet specified requirements and customer expectations.",
    },
    {
      keyword: "Black-box testing",
      definition:
        "A testing technique that examines the functionality without looking into internal structures.",
    },
    {
      keyword: "White-box testing",
      definition:
        "A testing technique that examines the internal structures or workings of an application.",
    },
    {
      keyword: "Automated testing",
      definition:
        "The use of software tools to execute tests automatically, often for repetitive tasks.",
    },
    {
      keyword: "Manual testing",
      definition:
        "The process of manually checking software for defects without the use of tools or scripts.",
    },
  ],
  starterQuiz: {
    version: "v2" as const,
    imageAttributions: [],
    questions: [
      {
        questionType: "multiple-choice" as const,
        question: "What is the software development lifecycle?",
        answers: ["A series of phases in software development"],
        distractors: [
          "A single stage process in software creation",
          "An unrelated sequence of steps",
        ],
        hint: null,
      },
      {
        questionType: "multiple-choice" as const,
        question: "Why is quality assurance important in software development?",
        answers: ["To ensure products meet requirements"],
        distractors: [
          "To reduce the cost of software",
          "To increase the complexity of software",
        ],
        hint: null,
      },
      {
        questionType: "multiple-choice" as const,
        question: "What is debugging?",
        answers: ["Finding and fixing errors in code"],
        distractors: ["Writing new code", "Testing user interfaces"],
        hint: null,
      },
      {
        questionType: "multiple-choice" as const,
        question: "Name a type of software application.",
        answers: ["Web application"],
        distractors: ["Hardware device", "Network cable"],
        hint: null,
      },
      {
        questionType: "multiple-choice" as const,
        question: "What is a basic programming concept?",
        answers: ["Loops"],
        distractors: ["Photoshop filters", "Network routers"],
        hint: null,
      },
      {
        questionType: "multiple-choice" as const,
        question: "What is the purpose of testing?",
        answers: ["To ensure functionality and reliability"],
        distractors: [
          "To increase the price",
          "To make the software more colourful",
        ],
        hint: null,
      },
    ],
  },
  learningCycles: [
    "Identify various software testing techniques and their definitions",
    "Explain the purposes of different software testing techniques",
    "Evaluate the effectiveness of different software testing techniques for specific scenarios",
  ],
  misconceptions: [
    {
      description:
        "Testing should occur at multiple stages throughout the software development lifecycle to catch issues early.",
      misconception: "Testing is only done after development",
    },
    {
      description:
        "Both automated and manual testing have their roles; manual testing is still necessary for exploratory and usability testing.",
      misconception: "Automated testing eliminates the need for manual testing",
    },
    {
      description:
        "Testing reduces the number of bugs but cannot guarantee a completely bug-free application.",
      misconception: "Testing guarantees bug-free software",
    },
  ],
  priorKnowledge: [
    "Understand the software development lifecycle",
    "Recognise the importance of quality assurance in software development",
    "Familiarity with basic programming concepts",
    "Awareness of different types of software applications",
    "Basic knowledge of debugging techniques",
  ],
  learningOutcome:
    "I can explain different software testing techniques and their purposes.",
  keyLearningPoints: [
    "Software testing ensures the functionality and reliability of applications",
    "Different testing techniques are used depending on the objectives",
    "Manual and automated testing have distinct advantages and disadvantages",
    "Black-box testing focuses on input and output without considering internal code structure",
    "White-box testing involves testing the internal structures and workings of an application",
  ],
  additionalMaterials: "None",
};

const lessonPlanWithoutExitQuiz = {
  ...completedLessonPlan,
  exitQuiz: undefined,
};

export const lessonPlans = {
  categorised: lessonPlanCategorised,
  ragResult: lessonPlanRagResult,
  completed: completedLessonPlan,
  completedExceptExitQuiz: lessonPlanWithoutExitQuiz,
};
