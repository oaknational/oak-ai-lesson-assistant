import type { PatchDocument } from "../../../protocol/jsonPatchProtocol";
import type { Quiz } from "../../../protocol/schema";
import type { QuizQuestionWithRawJson } from "../interfaces";

export const cachedQuiz: QuizQuestionWithRawJson[] = [
  {
    question: "How many degrees in 2 right angles?",
    answers: ["180°"],
    distractors: ["60°", "90°"],
    rawQuiz: [
      {
        questionId: 229205,
        questionUid: "QUES-BPWF2-29205",
        questionType: "short-answer",
        questionStem: [
          {
            text: "Adjacent multiples of 8 can be found by increasing or decreasing a multiple by {{ }}.",
            type: "text",
          },
        ],
        answers: {
          "short-answer": [
            {
              answer: [
                {
                  text: "8",
                  type: "text",
                },
              ],
              answerIsDefault: true,
            },
            {
              answer: [
                {
                  text: "eight",
                  type: "text",
                },
              ],
              answerIsDefault: false,
            },
          ],
        },
        feedback: "Yes, adjacent multiples have a difference of 8.",
        hint: "Think about the words increase and decrease. You could think of adding and subtracting.",
        active: false,
      },
    ],
  },
  {
    question:
      "Two shapes are {{}} if the only difference between them is their size.",
    answers: ["similar"],
    distractors: [
      "No distractors for short answer",
      "No distractors for short answer",
    ],
    rawQuiz: [
      {
        questionId: 229206,
        questionUid: "QUES-RLYY2-29206",
        questionType: "short-answer",
        questionStem: [
          {
            text: "Two shapes are {{}} if the only difference between them is their size.",
            type: "text",
          },
        ],
        answers: {
          "short-answer": [
            {
              answer: [
                {
                  text: "similar",
                  type: "text",
                },
              ],
              answerIsDefault: true,
            },
          ],
        },
        feedback:
          "Correct! Similar shapes have the same shape but different sizes.",
        hint: "Think about shapes that look the same but are different sizes.",
        active: true,
      },
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
    rawQuiz: [
      {
        questionId: 229207,
        questionUid: "QUES-XRES2-29207",
        questionType: "short-answer",
        questionStem: [
          {
            text: "A fruit stall is having a sale. It sells cherries in boxes of four pairs. How many cherries are there in six packs? There will be {{ }} in six packs.",
            type: "text",
          },
        ],
        answers: {
          "short-answer": [
            {
              answer: [
                {
                  text: "24",
                  type: "text",
                },
              ],
              answerIsDefault: true,
            },
          ],
        },
        feedback:
          "Correct! 4 pairs = 8 cherries per box. 6 boxes × 8 cherries = 24 cherries.",
        hint: "Each box contains 4 pairs of cherries. How many cherries is that per box?",
        active: true,
      },
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
    rawQuiz: [
      {
        questionId: 229208,
        questionUid: "QUES-RKQC2-29208",
        questionType: "multiple-choice",
        questionStem: [
          {
            text: "In which image is the circumference labelled with a question mark?",
            type: "text",
          },
        ],
        answers: {
          "multiple-choice": [
            {
              answer: [
                {
                  text: "![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1703169784/fg4uyx41rfnksbvav2nh.png)",
                  type: "text",
                },
              ],
              answerIsCorrect: true,
            },
            {
              answer: [
                {
                  text: "![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1703163380/pz6cn5k4wmowycnjq5am.png)",
                  type: "text",
                },
              ],
              answerIsCorrect: false,
            },
            {
              answer: [
                {
                  text: "![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1703169784/mr09mrwkqdtk1dvjdoi0.png)",
                  type: "text",
                },
              ],
              answerIsCorrect: false,
            },
          ],
        },
        feedback:
          "Correct! The first image shows the circumference marked with a question mark.",
        hint: "Look for the image where the circumference (the distance around the circle) is marked with a question mark.",
        active: true,
      },
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
    rawQuiz: [
      {
        questionId: 229209,
        questionUid: "QUES-FZZN2-29209",
        questionType: "multiple-choice",
        questionStem: [
          {
            text: "Complete the statement. Triangle ABC and triangle XYZ are ____________.",
            type: "text",
          },
          {
            type: "image",
            imageObject: {
              secureUrl:
                "http://oaknationalacademy-res.cloudinary.com/image/upload/v1706110974/fukcqeavzcevgjhmm1n4.png",
              metadata: {
                attribution: "Two triangles with labeled angles",
              },
            },
          },
        ],
        answers: {
          "multiple-choice": [
            {
              answer: [
                {
                  text: "similar as the three interior angles are the same.",
                  type: "text",
                },
              ],
              answerIsCorrect: true,
            },
            {
              answer: [
                {
                  text: "congruent as the three interior angles are all the same.",
                  type: "text",
                },
              ],
              answerIsCorrect: false,
            },
            {
              answer: [
                {
                  text: "neither similar nor congruent.",
                  type: "text",
                },
              ],
              answerIsCorrect: false,
            },
          ],
        },
        feedback:
          "Correct! The triangles are similar because they have the same angles.",
        hint: "Look at the angles in both triangles. Are they the same?",
        active: true,
      },
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
    answers: ["similar", "Similar", "SIMILAR", "similar"],
    distractors: ["idk", "maybe"],
  },
  {
    question:
      "cherries cost £5 per box and boxes have 8 cherries but then there's a sale for 20% off and you buy 3 boxes how many cherries????",
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
    distractors: ["they look pretty", "triangles are my favourite shape"],
  },
];
