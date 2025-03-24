import type { QuizQuestion } from "../../../protocol/schema";

export const missingQuizQuestion: QuizQuestion = {
  question:
    "This quiz is missing questions. This is a placeholder question. This is an expected behaviour of the ML quiz generator, when it finds an excess of questions that it cannot fit into the 6 question space, it produces an overflow quiz, which is then padded to full size using the LLM generated questions produced by Aila. If you are seeing this message, it means that the overflow quiz could not be padded by the AILA questions and this placeholder question is being shown instead.",
  answers: [" ", " ", " "],
  distractors: [" ", " ", " "],
};
