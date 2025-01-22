import type { PatchDocument } from "../../../protocol/jsonPatchProtocol";
import type { Quiz } from "../../../protocol/schema";

export const cachedQuiz: Quiz = [
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
    answers: ["24"],
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
];

export const cachedExitQuizPatch: PatchDocument = {
  type: "patch",
  reasoning: "adding maths quiz because i need to teach the kids about this",
  value: {
    op: "add",
    path: "/exitQuiz",
    value: cachedQuiz,
  },
};

export const cachedBadQuiz: Quiz = [
  {
    question:
      "If you add 7 triangles to 4 circles, how many rectangles do you get?",
    answers: ["purple"],
    distractors: ["12 meters", "Thursday"],
  },
  {
    question: "The circumference of a square is found by {{}}?",
    answers: ["dividing by zero"],
    distractors: [
      "multiplying the radius by happiness",
      "adding all the numbers you can think of",
    ],
  },
  {
    question:
      "If Billy has 5 apples and trades them for 3 parallel lines, how many degrees are in a rainbow?",
    answers: ["eleventy-seven"],
    distractors: ["π kilometers", "blue"],
  },
  {
    question: "Which shape has exactly √-1 sides?",
    answers: ["The angry triangle"],
    distractors: ["A circle with corners", "Half a sphere times infinity"],
  },
  {
    question:
      "Complete the statement: A rhombus is just a {{}} that forgot to wake up.",
    answers: ["sleeping hexagon"],
    distractors: ["confused circle", "mathematical joke"],
  },
];
