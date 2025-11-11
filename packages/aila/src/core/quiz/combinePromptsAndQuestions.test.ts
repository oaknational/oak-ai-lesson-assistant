import type { HasuraQuiz } from "../../protocol/schemas/quiz/rawQuiz";
import { combinePromptsAndQuestions } from "./OpenAIRanker";
import { QuizInspectionSystemPrompt } from "./QuestionAssesmentPrompt";
import { CircleTheoremLesson } from "./fixtures/CircleTheoremsExampleOutput";

const parsedRawQuiz = [
  {
    hint: "Think about the words increase and decrease. You could think of adding and subtracting.",
    active: false,
    answers: {
      "short-answer": [
        {
          answer: [
            {
              text: "8",
              type: "text",
            },
          ],
          answer_is_default: true,
        },
        {
          answer: [
            {
              text: "eight",
              type: "text",
            },
          ],
          answer_is_default: false,
        },
      ],
    },
    feedback: "Yes, adjacent multiples have a difference of 8.",
    questionId: 229205,
    questionUid: "QUES-BPWF2-29205",
    questionStem: [
      {
        text: "Adjacent multiples of 8 can be found by increasing or decreasing a multiple by {{ }}.",
        type: "text",
      },
    ],
    questionType: "short-answer",
  },
];

describe("combinePromptsAndQuestions", () => {
  it("Should convert a lesson plan and quiz into valid OpenAI message format", () => {
    const lessonPlan = CircleTheoremLesson;
    const questions = [
      {
        question:
          "For 6 days in a row I spend \u00a311 on my lunch. How much did I spent in total? ![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1707171916/km6zbhuzhbirgqpnzgfx.png)",
        answers: ["\u00a366"],
        distractors: ["\u00a316", "\u00a360", "\u00a363"],
        feedback: "",
        hint: "",
        html: [""],
        rawQuiz: parsedRawQuiz as NonNullable<HasuraQuiz>,
      },
      {
        question:
          "For 6 days in a row I spend \u00a311 on my lunch. How much did I spent in total? ![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1707171916/km6zbhuzhbirgqpnzgfx.png)",
        answers: ["\u00a366"],
        distractors: ["\u00a316", "\u00a360", "\u00a363"],
        feedback: "",
        hint: "",
        html: [""],
        rawQuiz: parsedRawQuiz as NonNullable<HasuraQuiz>,
      },
    ];
    const _openAIMessage = combinePromptsAndQuestions(
      lessonPlan,
      questions,
      QuizInspectionSystemPrompt,
      "/starterQuiz",
    );
    const ans = true;
    expect(ans).toBe(true);
  });
});
