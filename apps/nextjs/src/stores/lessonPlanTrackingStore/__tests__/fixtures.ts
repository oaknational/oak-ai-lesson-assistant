export const messages = {
  user1: {
    role: "user",
    content: "Make me a custom lesson plan about Roman Britain",
  },
  assistant1: {
    role: "assistant",
    content: "Here's a lesson about Roman Britain",
    // TODO: add realistic parts
    parts: [],
  },
  user2Refinement: {
    role: "user",
    content: "Add more castles",
  },
  user2Continue: {
    role: "user",
    // TODO: check
    content: "continue",
  },
  assistant2Refinement: {
    role: "assistant",
    content: "Here's a lesson about Roman Britain with more castles",
    // TODO: add realistic parts
    parts: [],
  },
} as const;

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
        answers: ["Testing based on inputs and outputs"],
        question: "What is black-box testing?",
        distractors: [
          "Testing internal structures",
          "Testing with software tools",
        ],
      },
      {
        answers: ["Testing internal structures"],
        question: "What does white-box testing involve?",
        distractors: ["Testing inputs and outputs", "Testing without tools"],
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
        answers: ["Validating functionality from an end-user perspective"],
        question: "What is the purpose of black-box testing?",
        distractors: [
          "Ensuring code correctness",
          "Testing with automation tools",
        ],
      },
      {
        answers: ["Provides flexibility and human insight"],
        question: "Why is manual testing beneficial?",
        distractors: [
          "Ensures internal code correctness",
          "Automates repetitive tasks",
        ],
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
        answers: ["User interface testing"],
        question: "In which scenario is black-box testing most effective?",
        distractors: ["Code quality assurance", "Regression testing"],
      },
      {
        answers: ["Automated testing"],
        question: "Which testing is efficient for regression testing?",
        distractors: ["Manual testing", "Black-box testing"],
      },
    ],
  },
  subject: "computing",
  exitQuiz: [
    {
      answers: ["Inputs and outputs"],
      question: "What is the main focus of black-box testing?",
      distractors: ["Internal code", "Testing tools"],
    },
    {
      answers: ["White-box testing"],
      question: "Which technique involves testing internal structures?",
      distractors: ["Black-box testing", "Manual testing"],
    },
    {
      answers: ["For efficiency in repetitive tasks"],
      question: "Why is automated testing used?",
      distractors: ["For human insight", "For testing inputs and outputs"],
    },
    {
      answers: ["In exploratory tasks"],
      question: "When is manual testing most beneficial?",
      distractors: ["In repetitive tasks", "In regression testing"],
    },
    {
      answers: ["Black-box testing"],
      question:
        "Which testing technique validates functionality from an end-user perspective?",
      distractors: ["White-box testing", "Automated testing"],
    },
    {
      answers: ["Ensuring code correctness"],
      question: "What is the role of white-box testing?",
      distractors: ["Testing user interfaces", "Automating tasks"],
    },
  ],
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
  starterQuiz: [
    {
      answers: ["A series of phases in software development"],
      question: "What is the software development lifecycle?",
      distractors: [
        "A single stage process in software creation",
        "An unrelated sequence of steps",
      ],
    },
    {
      answers: ["To ensure products meet requirements"],
      question: "Why is quality assurance important in software development?",
      distractors: [
        "To reduce the cost of software",
        "To increase the complexity of software",
      ],
    },
    {
      answers: ["Finding and fixing errors in code"],
      question: "What is debugging?",
      distractors: ["Writing new code", "Testing user interfaces"],
    },
    {
      answers: ["Web application"],
      question: "Name a type of software application.",
      distractors: ["Hardware device", "Network cable"],
    },
    {
      answers: ["Loops"],
      question: "What is a basic programming concept?",
      distractors: ["Photoshop filters", "Network routers"],
    },
    {
      answers: ["To ensure functionality and reliability"],
      question: "What is the purpose of testing?",
      distractors: [
        "To increase the price",
        "To make the software more colourful",
      ],
    },
  ],
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

export const lessonPlans = {
  completed: completedLessonPlan,
};
