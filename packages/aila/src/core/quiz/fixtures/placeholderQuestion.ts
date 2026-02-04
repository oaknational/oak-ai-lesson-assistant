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
    source: {
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
            answer_is_default: true,
          },
        ],
      },
      feedback:
        "This is a placeholder question indicating no suitable questions were found.",
      hint: "Please provide feedback using the flag button if you believe you should not be seeing this message.",
      active: true,
    },
    imageMetadata: [],
  },
];
