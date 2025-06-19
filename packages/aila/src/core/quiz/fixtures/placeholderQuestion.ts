import type { QuizQuestion } from "../../../protocol/schema";
import type { QuizQuestionWithRawJson } from "../interfaces";

export const placeholderQuiz: QuizQuestionWithRawJson[] = [
  {
    question: "No questions found",
    answers: [
      "No questions found: The recommendation system you are trialling does not have suitable questions with the basedOn recommendation path. You are seeing this in place of an LLM generated quiz to make it clear that the recommendation system does not have suitable questions",
    ],
    distractors: [
      "Why am I seeing this? If you do not believe you should be trialling this system please provide feedback using the flag button and selecting other. Please use this for any other feedback on the recommended quiz with the title **Experimental Quiz**",
    ],
    rawQuiz: [
      {
        questionId: 999999,
        questionUid: "QUES-PLACE-999999",
        questionType: "short-answer",
        questionStem: [
          {
            text: "No questions found",
            type: "text",
          },
        ],
        answers: {
          "short-answer": [
            {
              answer: [
                {
                  text: "No questions found: The recommendation system you are trialling does not have suitable questions with the basedOn recommendation path. You are seeing this in place of an LLM generated quiz to make it clear that the recommendation system does not have suitable questions",
                  type: "text",
                },
              ],
              answerIsDefault: true,
            },
          ],
        },
        feedback:
          "This is a placeholder question indicating no suitable questions were found.",
        hint: "Please provide feedback using the flag button if you believe you should not be seeing this message.",
        active: true,
      },
    ],
  },
];
