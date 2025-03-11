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
    question: "angles?????",
    answers: ["180"],
    distractors: ["elephant", "banana"],
  },
  {
    question:
      "SHAPES ARE WHAT WHEN THEY LOOK KINDA THE SAME BUT DIFFERENT SIZES????????",
    answers: ["similar", "Similar", "SIMILAR", "similiar"],
    distractors: ["idk", "maybe"],
  },
  {
    question:
      "cherries cost £5 per box and boxes have 8 cherries but then theres a sale for 20% off and you buy 3 boxes how many cherries????",
    answers: ["24"],
    distractors: ["£12", "sale price"],
  },
  {
    question: "which one has the ? on it lol",
    answers: [
      "![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1703169784/fg4uyx41rfnksbvav2nh.png)",
    ],
    distractors: ["this one", "the other one"],
  },
  {
    question:
      "triangles ![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1706110974/fukcqeavzcevgjhmm1n4.png)",
    answers: ["theyre the same angles init"],
    distractors: ["they look pretty", "triangles are my favorite shape"],
  },
];
