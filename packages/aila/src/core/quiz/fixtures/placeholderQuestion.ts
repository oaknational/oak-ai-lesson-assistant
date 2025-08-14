import type { QuizV1Question } from "../../../protocol/schema";

export const placeholderQuiz: QuizV1Question[] = [
  {
    question: "No questions found",
    answers: [
      "No questions found: The recommendation system you are trialling does not have suitable questions with the basedOn recommendation path. You are seeing this in place of an LLM generated quiz to make it clear that the recommendation system does not have suitable questions",
    ],
    distractors: [
      "Why am I seeing this? If you do not believe you should be trialling this system please provide feedback using the flag button and selecting other. Please use this for any other feedback on the recommended quiz with the title **Experimental Quiz**",
    ],
  },
];
