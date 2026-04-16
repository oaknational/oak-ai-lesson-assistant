import type { RagQuizQuestion } from "../interfaces";

export const placeholderQuiz: RagQuizQuestion[] = [
  {
    question: {
      questionType: "short-answer",
      question: "No questions found",
      answers: [
        "No questions found: The recommendation system you are trialling does not have suitable questions with the basedOn recommendation path. You are seeing this in place of an LLM generated quiz to make it clear that the recommendation system does not have suitable questions",
      ],
      hint: "Please provide feedback using the flag button if you believe you should not be seeing this message.",
    },
    sourceUid: "QUES-PLACE-999999",
    imageMetadata: [],
  },
];
