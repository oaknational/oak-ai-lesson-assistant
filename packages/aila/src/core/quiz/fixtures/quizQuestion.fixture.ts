/* cspell:disable */
import type { QuizQuestionPool, RagQuizQuestion } from "../interfaces";

// Fixture data: V3-format quiz questions for testing.
// source field removed — raw Hasura provenance is no longer part of RagQuizQuestion.

export const cachedQuiz: RagQuizQuestion[] = [
  {
    question: {
      questionType: "short-answer",
      question:
        "Adjacent multiples of 8 can be found by increasing or decreasing a multiple by {{ }}.",
      answers: ["8", "eight"],
      hint: "Think about the words increase and decrease. You could think of adding and subtracting.",
    },
    sourceUid: "QUES-BPWF2-29205",
    imageMetadata: [],
  },
  {
    question: {
      questionType: "short-answer",
      question:
        "Two shapes are {{}} if the only difference between them is their size.",
      answers: ["similar"],
      hint: "Think about shapes that look the same but are different sizes.",
    },
    sourceUid: "QUES-RLYY2-29206",
    imageMetadata: [],
  },
  {
    question: {
      questionType: "short-answer",
      question:
        "A fruit stall is having a sale. It sells cherries in boxes of four pairs. How many cherries are there in six packs? There will be {{ }} in six packs.",
      answers: ["24"],
      hint: "Each box contains 4 pairs of cherries. How many cherries is that per box?",
    },
    sourceUid: "QUES-XRES2-29207",
    imageMetadata: [],
  },
  {
    question: {
      questionType: "multiple-choice",
      question:
        "In which image is the circumference labelled with a question mark?",
      answers: [
        "![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1703169784/fg4uyx41rfnksbvav2nh.png)",
      ],
      distractors: [
        "![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1703163380/pz6cn5k4wmowycnjq5am.png)",
        "![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1703169784/mr09mrwkqdtk1dvjdoi0.png)",
      ],
      hint: "Look for the image where the circumference (the distance around the circle) is marked with a question mark.",
    },
    sourceUid: "QUES-RKQC2-29208",
    imageMetadata: [],
  },
  {
    question: {
      questionType: "multiple-choice",
      question:
        "Complete the statement. Triangle ABC and triangle XYZ are ____________. ![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1706110974/fukcqeavzcevgjhmm1n4.png)",
      answers: ["similar as the three interior angles are the same."],
      distractors: [
        "congruent as the three interior angles are all the same.",
        "neither similar nor congruent.",
      ],
      hint: "Look at the angles in both triangles. Are they the same?",
    },
    sourceUid: "QUES-FZZN2-29209",
    imageMetadata: [],
  },
];

export const cachedBadQuiz: RagQuizQuestion[] = [
  {
    question: {
      questionType: "short-answer",
      question: "angles?????",
      answers: ["180"],
      hint: "just guess lol",
    },
    sourceUid: "QUES-BAD1-999001",
    imageMetadata: [],
  },
  {
    question: {
      questionType: "short-answer",
      question:
        "SHAPES ARE WHAT WHEN THEY LOOK KINDA THE SAME BUT DIFFERENT SIZES????????",
      answers: ["similar", "Similar", "SIMILAR"],
      hint: "just type similar in any case",
    },
    sourceUid: "QUES-BAD2-999002",
    imageMetadata: [],
  },
  {
    question: {
      questionType: "short-answer",
      question:
        "cherries cost £5 per box and boxes have 8 cherries but then there's a sale for 20% off and you buy 3 boxes how many cherries????",
      answers: ["24"],
      hint: "just put 24 trust me",
    },
    sourceUid: "QUES-BAD3-999003",
    imageMetadata: [],
  },
  {
    question: {
      questionType: "multiple-choice",
      question: "which one has the ? on it lol",
      answers: [
        "![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1703169784/fg4uyx41rfnksbvav2nh.png)",
      ],
      distractors: ["this one", "the other one"],
      hint: "look for the ? mark",
    },
    sourceUid: "QUES-BAD4-999004",
    imageMetadata: [],
  },
  {
    question: {
      questionType: "multiple-choice",
      question:
        "triangles ![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1706110974/fukcqeavzcevgjhmm1n4.png)",
      answers: ["theyre the same angles init"],
      distractors: ["they look pretty", "triangles are my favourite shape"],
      hint: "the angles are the same innit",
    },
    sourceUid: "QUES-BAD5-999005",
    imageMetadata: [],
  },
];

export function createMockQuestionPool(
  questions: RagQuizQuestion[],
  id: string = "test-id",
  title: string = "Test Lesson",
): QuizQuestionPool {
  return {
    questions,
    source: {
      type: "basedOnLesson",
      lessonPlanId: id,
      lessonTitle: title,
    },
  };
}
