export const exampleLessonPlan = {
  title: "The Science of Rainbows",
  subject: "science",
  keyStage: "key-stage-2",
  topic:
    "light refraction and reflection, color spectrum, prisms experiment, art project on rainbows",
  learningOutcome:
    "I can explain how rainbows form and the role of light refraction, reflection, and the colour spectrum.",
  learningCycles: [
    "Describe how light refraction and reflection contribute to rainbow formation.",
    "Identify the colours in a rainbow and explain the colour spectrum.",
    "Conduct an experiment with prisms to create mini rainbows and complete an art project to draw or paint rainbows.",
  ],
  priorKnowledge: [
    "Light travels in straight lines.",
    "Reflection occurs when light bounces off a surface.",
    "Refraction occurs when light changes direction as it passes from one transparent object to another.",
    "The visible spectrum consists of different colours.",
    "Prisms can split white light into different colours.",
  ],
  keyLearningPoints: [
    "Rainbows are formed by the refraction, reflection, and dispersion of light in water droplets.",
    "The visible spectrum includes red, orange, yellow, green, blue, indigo, and violet.",
    "Prisms can create mini rainbows by refracting light.",
  ],
  misconceptions: [
    {
      misconception: "Rainbows are objects in the sky.",
      description:
        "Rainbows are not physical objects but are optical phenomena caused by the interaction of light with water droplets.",
    },
    {
      misconception: "Rainbows only appear when it is raining.",
      description:
        "While rainbows are commonly seen during rain, they can also be observed near waterfalls, fountains, or any source of water droplets with the presence of sunlight.",
    },
    {
      misconception: "All rainbows look the same.",
      description:
        "The appearance of a rainbow can vary depending on the size of the water droplets and the angle of the light.",
    },
  ],
  keywords: [
    {
      keyword: "Refraction",
      definition:
        "Refraction is the bending of light as it passes from one transparent material to another.",
    },
    {
      keyword: "Reflection",
      definition: "Reflection occurs when light bounces off a surface.",
    },
    {
      keyword: "Spectrum",
      definition:
        "A spectrum is a range of different colours produced when light is dispersed.",
    },
    {
      keyword: "Prism",
      definition:
        "A prism is a transparent object that refracts light and can separate it into a spectrum of colours.",
    },
    {
      keyword: "Rainbow",
      definition:
        "A rainbow is an arc of colours visible in the sky, caused by the refraction, reflection, and dispersion of light in water droplets.",
    },
  ],
  starterQuiz: [
    {
      question: "How does light travel?",
      answers: ["In straight lines"],
      distractors: ["In curved paths", "In random directions"],
    },
    {
      question: "What happens when light bounces off a surface?",
      answers: ["Reflection"],
      distractors: ["Refraction", "Dispersion"],
    },
    {
      question:
        "What occurs when light changes direction as it passes through different transparent materials?",
      answers: ["Refraction"],
      distractors: ["Reflection", "Absorption"],
    },
    {
      question: "What is the visible spectrum?",
      answers: ["A range of different colours"],
      distractors: ["A single colour", "A light source"],
    },
    {
      question: "What can prisms do to white light?",
      answers: ["Split it into different colours"],
      distractors: ["Absorb it", "Reflect it"],
    },
    {
      question: "What is required to see a rainbow?",
      answers: ["Light and water droplets"],
      distractors: ["Only light", "Only water"],
    },
  ],
  exitQuiz: [
    {
      question: "How are rainbows formed?",
      answers: [
        "By the refraction, reflection, and dispersion of light in water droplets",
      ],
      distractors: [
        "By mixing paint colours",
        "By the reflection of light off shiny surfaces",
      ],
    },
    {
      question: "What colours are in a rainbow?",
      answers: ["Red, orange, yellow, green, blue, indigo, violet"],
      distractors: ["Red, green, blue, white", "All shades of red"],
    },
    {
      question: "What does a prism do to white light?",
      answers: ["Separates it into a spectrum of colours"],
      distractors: [
        "Combines it into a single colour",
        "Absorbs it completely",
      ],
    },
    {
      question: "What causes the bending of light when it enters a new medium?",
      answers: ["Refraction"],
      distractors: ["Reflection", "Dispersion"],
    },
    {
      question: "Which colour in the rainbow has the shortest wavelength?",
      answers: ["Violet"],
      distractors: ["Red", "Green"],
    },
    {
      question: "What is a spectrum?",
      answers: [
        "A range of different colours produced when light is dispersed",
      ],
      distractors: ["A single colour", "A type of light source"],
    },
  ],
  cycle1: {
    title:
      "How Light Refraction and Reflection Contribute to Rainbow Formation",
    durationInMinutes: 15,
    explanation: {
      spokenExplanation: [
        "Discuss how light travels in straight lines and interacts with objects.",
        "Explain that when light enters water droplets, it slows down and bends (refraction).",
        "Describe how light is reflected inside the water droplet and then refracted again as it exits.",
        "Illustrate that this process results in a spectrum of colours forming a rainbow.",
      ],
      accompanyingSlideDetails:
        "Diagram showing light entering a water droplet, refracting, reflecting, and exiting as a spectrum of colours.",
      imagePrompt: "light refraction rainbow formation",
      slideText:
        "Light refracts, reflects, and refracts again in water droplets to form a rainbow.",
    },
    checkForUnderstanding: [
      {
        question: "What happens to light when it enters a water droplet?",
        answers: ["It slows down and bends"],
        distractors: ["It speeds up", "It stops moving"],
      },
      {
        question:
          "What results from light refracting and reflecting in water droplets?",
        answers: ["A spectrum of colours"],
        distractors: ["A single colour", "Darkness"],
      },
    ],
    practice:
      "Draw a diagram showing light entering a water droplet, refracting, reflecting, and exiting as a spectrum of colours.",
    feedback:
      "Model answer: A diagram showing light entering a water droplet, bending (refraction), reflecting inside the droplet, and exiting as a spectrum of colours.",
  },
  cycle2: {
    title: "The Colours in a Rainbow and the Colour Spectrum",
    durationInMinutes: 15,
    explanation: {
      spokenExplanation: [
        "Introduce the visible spectrum as the range of colours produced when light is dispersed.",
        "List the colours of the rainbow: red, orange, yellow, green, blue, indigo, and violet.",
        "Explain that each colour has a different wavelength, with red having the longest and violet the shortest.",
        "Discuss how prisms can separate white light into these colours, similar to water droplets in a rainbow.",
      ],
      accompanyingSlideDetails:
        "Image of a rainbow with labelled colours and a prism separating white light into a spectrum.",
      imagePrompt: "rainbow colour spectrum",
      slideText:
        "The visible spectrum includes red, orange, yellow, green, blue, indigo, and violet.",
    },
    checkForUnderstanding: [
      {
        question: "Which colour in the rainbow has the longest wavelength?",
        answers: ["Red"],
        distractors: ["Violet", "Blue"],
      },
      {
        question: "What does a prism do to white light?",
        answers: ["Separates it into different colours"],
        distractors: ["Combines it", "Absorbs it"],
      },
    ],
    practice:
      "List and arrange the colours of the rainbow in order from longest to shortest wavelength.",
    feedback:
      "Model answer: The colours of the rainbow in order from longest to shortest wavelength are red, orange, yellow, green, blue, indigo, and violet.",
  },
  cycle3: {
    title: "Prism Experiment and Art Project on Rainbows",
    durationInMinutes: 15,
    explanation: {
      spokenExplanation: [
        "Introduce the experiment with prisms to create mini rainbows.",
        "Explain the steps: Shine white light through a prism to refract and separate it into a spectrum of colours.",
        "Discuss how this is similar to how rainbows form in the sky.",
        "Introduce the art project: Draw or paint a rainbow, ensuring to include all the colours in the correct order.",
      ],
      accompanyingSlideDetails:
        "Step-by-step images of the prism experiment and examples of rainbow art projects.",
      imagePrompt: "prism experiment rainbow",
      slideText:
        "Use a prism to create a mini rainbow and then draw or paint your own rainbow.",
    },
    checkForUnderstanding: [
      {
        question: "What should you do first in the prism experiment?",
        answers: ["Shine white light through the prism"],
        distractors: ["Draw the rainbow", "Mix the colours"],
      },
      {
        question: "What is the purpose of the art project?",
        answers: [
          "To draw or paint a rainbow with all the colours in the correct order",
        ],
        distractors: ["To create a sculpture", "To write a story"],
      },
    ],
    practice:
      "Conduct the prism experiment to create a mini rainbow. Then, draw or paint your own rainbow, including all the colours in the correct order.",
    feedback:
      "Success criteria: Ensure your rainbow has red, orange, yellow, green, blue, indigo, and violet in the correct order. Your prism experiment should show a spectrum of colours when white light passes through the prism.",
  },
};
