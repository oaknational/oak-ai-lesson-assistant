import type { Quiz } from "../../protocol/schema";

export const mathsQuizFixture: Quiz = [
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
  {
    question:
      "Here is an image ![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1706110974/fukcqeavzcevgjhmm1n4.png) and here is the same image  ![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1706110974/fukcqeavzcevgjhmm1n4.png)",
    answers: [
      "![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1703169784/fg4uyx41rfnksbvav2nh.png)",
    ],
    distractors: [
      "![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1703163380/pz6cn5k4wmowycnjq5am.png)",
      "![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1703169784/mr09mrwkqdtk1dvjdoi0.png)",
    ],
  },
];
