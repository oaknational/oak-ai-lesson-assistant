export const CircleTheoremLesson = {
  basedOn: {
    id: "clna7lofy0og0p4qxju5j6z56", // This is the corresponsing label in the lesson table for slug reading-timetables-6wwkgt
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

export const CircleTheoremLessonPlan2 = {
  basedOn: { id: "clna7o1921o02p4qx8mwzancm", title: "Dummy title" },
  title: "Circle Theorems: A tangent and radius are perpendicular",
  topic: "Circle Theorems",
  cycle1: {
    title: "Explain Tangent-Radius Perpendicularity",
    feedback:
      "Model answer: The angle between the tangent and radius should measure 90 degrees. Ensure your tangent touches the circle at exactly one point.",
    practice:
      "Draw a circle and a tangent. Mark the radius to the point of contact. Measure the angle between the radius and tangent. Show that it's 90 degrees.",
    explanation: {
      slideText:
        "A tangent meets a radius at a 90-degree angle at the point of contact.",
      imagePrompt: "tangent radius 90 degrees circle diagram",
      spokenExplanation: [
        "Introduce the concept of a tangent as a line touching a circle at exactly one point.",
        "Explain the radius as a line from the circle's centre to its boundary.",
        "Demonstrate that the angle formed between the tangent and radius is always 90 degrees.",
        "Show this through multiple examples with diagrams.",
        "Highlight that this is a consistent property regardless of where the tangent is drawn.",
        "Reinforce by stating that this relationship is a fundamental circle theorem.",
      ],
      accompanyingSlideDetails:
        "Illustrations showing a tangent and radius meeting at 90 degrees across several examples.",
    },
    durationInMinutes: 15,
    checkForUnderstanding: [
      {
        answers: ["90 degrees"],
        question: "What angle is formed where a tangent meets a radius?",
        distractors: ["45 degrees", "180 degrees"],
      },
      {
        answers: ["No, it remains 90 degrees"],
        question:
          "Does changing the point of tangency affect the 90-degree angle?",
        distractors: [
          "Yes, depends on the circle size",
          "Yes, depends on line length",
        ],
      },
    ],
  },
  cycle2: {
    title: "Apply The Theorem in Triangles",
    feedback:
      "Model answer: Subtract the known angles from 180 degrees. Verify that the tangent-radius angle is 90 degrees for accuracy.",
    practice:
      "Given a triangle with a tangent and radius, calculate the missing angle using the theorem and the triangle angle sum.",
    explanation: {
      slideText:
        "Use tangent-radius 90-degree angle and triangle sum of 180 degrees to calculate unknown angles.",
      imagePrompt: "triangle tangent radius angle calculation",
      spokenExplanation: [
        "Introduce the problem of finding angles within a triangle formed by a tangent, a radius, and another line.",
        "Use the theorem that the tangent and radius form a 90-degree angle.",
        "Emphasise that the angles in a triangle sum to 180 degrees.",
        "Work through an example, subtracting the known angles to find the unknown angle.",
        "Provide a second real-world application for practice.",
      ],
      accompanyingSlideDetails:
        "Diagrams of triangles featuring a tangent-radii angle with measurements.",
    },
    durationInMinutes: 15,
    checkForUnderstanding: [
      {
        answers: ["180 degrees"],
        question: "What is the sum of angles in a triangle?",
        distractors: ["90 degrees", "360 degrees"],
      },
      {
        answers: ["90 degrees"],
        question: "Which angle is always formed when a tangent meets a radius?",
        distractors: ["45 degrees", "60 degrees"],
      },
    ],
  },
  cycle3: {
    title: "Identify Isosceles Triangles and Equal Tangents",
    feedback:
      "Model answer: Use markings to verify equal sides. If tangents are from the same point, they are of equal length.",
    practice:
      "Identify isosceles triangles using markings on diagrams. Calculate lengths using equal tangents theorem.",
    explanation: {
      slideText:
        "Isosceles triangles have 2 equal sides & base angles. Tangents from a point are equal lengths.",
      imagePrompt: "isosceles triangle tangents equal length",
      spokenExplanation: [
        "Explain isosceles triangles have two equal sides, often marked with dashes.",
        "Discuss that base angles in isosceles triangles are equal.",
        "Introduce the circle theorem that tangents from the same point to the circle are equal in length.",
        "Show by measuring tangents from an external point to the points of contact.",
        "Apply this theorem to conclude equal tangents mean equal lengths.",
      ],
      accompanyingSlideDetails:
        "Illustrations showing isosceles triangles and two tangents from the same external point.",
    },
    durationInMinutes: 15,
    checkForUnderstanding: [
      {
        answers: ["Two equal sides and angles"],
        question: "What defines an isosceles triangle?",
        distractors: ["Three equal angles", "All sides different"],
      },
      {
        answers: ["Always, from the same point to a circle"],
        question: "When are two tangents from a point equal in length?",
        distractors: ["Only when tangents are parallel", "Never equal"],
      },
    ],
  },
  subject: "maths",
  exitQuiz: [
    {
      answers: ["A tangent meets a radius at 90 degrees"],
      question: "What theorem relates tangents and radii?",
      distractors: [
        "Tangents are equal to the radius",
        "Tangents form 45-degree angles",
      ],
    },
    {
      answers: ["Subtract known angles from 180 degrees"],
      question: "How is the angle inside a triangle calculated?",
      distractors: ["Add known angles to 90 degrees", "Multiply known angles"],
    },
    {
      answers: ["Two equal sides and base angles"],
      question: "What property do isosceles triangles have?",
      distractors: ["Three equal sides", "Different angles"],
    },
    {
      answers: ["When from the same exterior point"],
      question: "When are tangents from a point equal?",
      distractors: [
        "When both touch different circles",
        "When drawn to any circle part",
      ],
    },
    {
      answers: ["Tangent-radius perpendicularity"],
      question: "Which theorem uses a 90-degree angle?",
      distractors: ["Tangent equality", "Circle circumference"],
    },
    {
      answers: ["For right-angle triangles from radius-tangent points"],
      question: "How do you use Pythagoras in this context?",
      distractors: ["Only for scalene triangles", "To find circumference"],
    },
  ],
  keyStage: "key-stage-4",
  keywords: [
    {
      keyword: "Circle theorem",
      definition:
        "A set of theorems related to angles and lines associated with circles",
    },
    {
      keyword: "Tangent",
      definition: "A straight line that touches a circle at exactly one point",
    },
    {
      keyword: "Radius",
      definition:
        "A line from the centre of the circle to a point on its circumference",
    },
    {
      keyword: "Perpendicular",
      definition:
        "Two lines or segments that intersect to form a 90-degree angle",
    },
    {
      keyword: "Isosceles triangle",
      definition: "A triangle with at least two sides of equal length",
    },
    {
      keyword: "Pythagoras' theorem",
      definition:
        "A theorem stating that in a right triangle, a² + b² = c², where c is the hypotenuse",
    },
  ],
  starterQuiz: [
    {
      answers: ["A straight line that touches a circle at one point"],
      question: "What is a tangent?",
      distractors: [
        "A line that passes through the centre of the circle",
        "A point on the circumference of the circle",
      ],
    },
    {
      answers: ["180 degrees"],
      question: "What is the angle sum in a triangle?",
      distractors: ["90 degrees", "360 degrees"],
    },
    {
      answers: ["At least two equal sides"],
      question: "What defines an isosceles triangle?",
      distractors: ["All sides equal", "All angles different"],
    },
    {
      answers: ["Calculating lengths in right triangles"],
      question: "What is Pythagoras' theorem used for?",
      distractors: [
        "Finding angles in triangles",
        "Calculating circumference of circles",
      ],
    },
    {
      answers: ["At 90 degrees"],
      question: "Where does a tangent meet a radius in a circle?",
      distractors: ["At any angle", "At 45 degrees"],
    },
    {
      answers: ["Touches the circle at one point"],
      question: "What distinguishes a tangent from other lines to a circle?",
      distractors: ["Crosses the circle", "Passes through the centre"],
    },
  ],
  learningCycles: [
    "Explain the theorem where a tangent and radius meet at 90 degrees",
    "Apply the theorem to solve angle problems within triangles",
    "Identify isosceles triangles and apply the theorem of equal tangents",
  ],
  misconceptions: [
    {
      description:
        "Tangents always meet the radius at a 90-degree angle. Emphasise this with visual aids and repeated examples.",
      misconception: "Tangents can meet the radius at any angle",
    },
    {
      description:
        "Only tangents from a single external point to the circle are equal in length. Highlight the specific conditions.",
      misconception: "Any two lines from a point to a circle are equal",
    },
  ],
  priorKnowledge: [
    "Basic properties of a circle, such as centre and radius",
    "Understanding of angles and how they sum in a triangle",
    "Familiarity with the concept of isosceles triangles",
    "Basic knowledge of Pythagoras' theorem",
    "How to measure angles in degrees",
  ],
  learningOutcome:
    "I can understand and apply theorems that describe the properties of tangents and radii in circles.",
  keyLearningPoints: [
    "A tangent to a circle meets the radius at 90 degrees",
    "The angles in a triangle sum to 180 degrees",
    "In isosceles triangles, the base angles are equal",
    "Two tangents from a point to a circle are equal in length",
    "Pythagoras' theorem is used to calculate lengths in right triangles",
  ],
  additionalMaterials: "None",
};
