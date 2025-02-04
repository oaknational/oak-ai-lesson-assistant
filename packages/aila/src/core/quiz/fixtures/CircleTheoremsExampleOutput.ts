export const CircleTheoremLesson = {
  basedOn: {
    id: "Tr9r1RlwSNes3X2ZgRQSi", // This is the corresponsing label in the lesson table for slug reading-timetables-6wwkgt
    title: "TEST-LESSON-READING-TIMETABLES",
  },
  title: "Circle Theorems",
  subject: "maths",
  keyStage: "key-stage-4",
  topic: "Circle Theorems",
  learningOutcome:
    "I can identify and apply key circle theorems to solve problems involving angles and arcs.",
  learningCycles: [
    "Identify and describe the key circle theorems.",
    "Apply circle theorems to solve mathematical problems.",
    "Evaluate the use of different circle theorems in complex scenarios.",
  ],
  priorKnowledge: [
    "Understanding of basic geometric shapes and their properties.",
    "Familiarity with the concept of a circle, including radius, diameter, and circumference.",
    "Knowledge of angles and how to measure them.",
    "Ability to perform basic algebraic manipulations.",
    "Understanding of congruence and similarity in geometric figures.",
  ],
  keyLearningPoints: [
    "The angle at the centre of a circle is twice the angle at the circumference.",
    "Angles in the same segment of a circle are equal.",
    "The opposite angles of a cyclic quadrilateral sum to 180 degrees.",
    "The angle in a semicircle is a right angle.",
    "The perpendicular from the centre of a circle to a chord bisects the chord.",
  ],
  misconceptions: [
    {
      misconception: "The angle at the centre is always 90 degrees",
      description:
        "Some pupils may think the angle at the centre is always 90 degrees. Clarify that it depends on the arc size.",
    },
    {
      misconception: "All angles in a circle are equal",
      description:
        "Pupils might assume all angles in a circle are equal. Explain that angles vary based on their position and context.",
    },
    {
      misconception: "A diameter bisects all angles",
      description:
        "Pupils may believe a diameter bisects all angles. Highlight that it only bisects the circle into two equal arcs.",
    },
  ],
  keywords: [
    {
      keyword: "Theorem",
      definition:
        "A statement or proposition that can be proven to be true based on previously established statements.",
    },
    {
      keyword: "Chord",
      definition:
        "A straight line connecting two points on a circle's circumference.",
    },
    { keyword: "Arc", definition: "A part of the circumference of a circle." },
    {
      keyword: "Cyclic quadrilateral",
      definition:
        "A quadrilateral with all its vertices on the circumference of a circle.",
    },
    {
      keyword: "Congruence",
      definition: "The quality of being identical in shape and size.",
    },
  ],
  starterQuiz: [
    {
      question: "How many degrees in 2 right angles?",
      answers: ["180°"],
      distractors: ["60°", "90°"],
    },
    {
      question:
        "Two shapes are {{}} if the only difference between them is their size.",
      answers: ["similar"],
      distractors: [
        "No distractors for short answer",
        "No distractors for short answer",
      ],
    },
    {
      question:
        "A fruit stall is having a sale. It sells cherries in boxes of four pairs. How many cherries are there in six packs? There will be {{ }} in six packs.",
      answers: ["24", "twenty four"],
      distractors: [
        "No distractors for short answer",
        "No distractors for short answer",
      ],
    },
    {
      question:
        "In which image is the circumference labelled with a question mark?",
      answers: [
        "![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1703169784/fg4uyx41rfnksbvav2nh.png)",
      ],
      distractors: [
        "![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1703163380/pz6cn5k4wmowycnjq5am.png)",
        "![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1703169784/mr09mrwkqdtk1dvjdoi0.png)",
      ],
    },
    {
      question:
        "Complete the statement. Triangle ABC and triangle XYZ are ____________. ![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1706110974/fukcqeavzcevgjhmm1n4.png)",
      answers: ["similar as the three interior angles are the same."],
      distractors: [
        "congruent as the three interior angles are all the same.",
        "neither similar nor congruent.",
      ],
    },
  ],
  cycle1: {
    title: "Identifying Key Circle Theorems",
    durationInMinutes: 15,
    explanation: {
      spokenExplanation: [
        "Introduce the concept of circle theorems and their importance in geometry.",
        "Explain that the angle at the centre of a circle is twice the angle at the circumference.",
        "Describe how angles in the same segment are equal and why this is significant.",
        "Discuss the properties of a cyclic quadrilateral, noting that opposite angles sum to 180 degrees.",
        "Highlight that the angle in a semicircle is a right angle.",
      ],
      accompanyingSlideDetails:
        "Diagrams illustrating the angle at the centre and circumference, angles in the same segment, and a cyclic quadrilateral.",
      imagePrompt: "circle theorems diagrams",
      slideText:
        "Key circle theorems include: angle at the centre is twice that at the circumference, angles in the same segment are equal, cyclic quadrilateral angles sum to 180 degrees.",
    },
    checkForUnderstanding: [
      {
        question:
          "What is the relationship between the angle at the centre and the angle at the circumference?",
        answers: [
          "The angle at the centre is twice the angle at the circumference.",
        ],
        distractors: [
          "The angle at the centre is half the angle at the circumference.",
          "The angles are equal.",
        ],
      },
      {
        question: "What is true about angles in the same segment of a circle?",
        answers: ["They are equal."],
        distractors: [
          "They sum to 90 degrees.",
          "They vary based on position.",
        ],
      },
    ],
    practice:
      "Label the diagrams with the correct circle theorems. Use the information provided to identify and annotate each diagram correctly.",
    feedback:
      "Model answer: The diagram of the angle at the centre should show it being twice the angle at the circumference. Angles in the same segment should be marked as equal.",
  },
  cycle2: {
    title: "Applying Circle Theorems",
    durationInMinutes: 15,
    explanation: {
      spokenExplanation: [
        "Discuss how to use circle theorems to find unknown angles and lengths in various geometric problems.",
        "Provide examples of using the angle at the centre theorem to find missing angles.",
        "Show how angles in the same segment theorem can be applied to solve problems.",
        "Demonstrate solving a problem involving opposite angles in a cyclic quadrilateral.",
        "Illustrate the application of the angle in a semicircle being a right angle.",
      ],
      accompanyingSlideDetails:
        "Example problems illustrating the application of each circle theorem discussed.",
      imagePrompt: "circle theorems application examples",
      slideText:
        "Apply circle theorems to solve problems involving unknown angles and lengths in geometric figures.",
    },
    checkForUnderstanding: [
      {
        question:
          "Which theorem helps find missing angles when given the angle at the circumference?",
        answers: [
          "The angle at the centre is twice the angle at the circumference.",
        ],
        distractors: [
          "The angle in a semicircle is a right angle.",
          "Angles in the same segment are equal.",
        ],
      },
      {
        question:
          "How can you use the cyclic quadrilateral theorem in solving problems?",
        answers: ["Opposite angles sum to 180 degrees."],
        distractors: [
          "Adjacent angles are equal.",
          "All angles are 90 degrees.",
        ],
      },
    ],
    practice:
      "Solve a series of problems involving circle theorems to find unknown angles and lengths. Use diagrams to support your solutions.",
    feedback:
      "Model answer: For each problem, identify the applicable theorem and show step-by-step calculations leading to the solution. Ensure that diagrams are correctly annotated.",
  },
  exitQuiz: [
    {
      question:
        "Work out the length of BM. ![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1707157889/x0zkhtqmat2qjbeykaep.png)",
      answers: ["12 cm"],
      distractors: ["18 cm", "24 cm", "6 cm"],
    },
    {
      question:
        "The diagram shows a circle with centre O and M is the midpoint of chord AB. Which statement is INCORRECT? ![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1707157891/jzj1whq88imewdz8moar.png)",
      answers: ["OA=AM"],
      distractors: ["AM=0.5AB", "AM=BM", "OA=OB"],
    },
    {
      question:
        "Which circle theorem is being shown in the diagram? ![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1707163527/nudpmbhfucdchpb2jvvd.png)",
      answers: ["A"],
      distractors: ["B", "C", "D"],
    },
    {
      question:
        "Which circle theorem is being shown in the diagram? ![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1707163529/szlbxsyihr4oxzt5xll3.png)",
      answers: ["D"],
      distractors: ["A", "B", "C"],
    },
    {
      question:
        "Which circle theorem is being shown in the diagram? ![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1707163545/dfdqz5vcslzfnxke8j2g.png)",
      answers: ["B"],
      distractors: ["A", "C", "D"],
    },
  ],
};
