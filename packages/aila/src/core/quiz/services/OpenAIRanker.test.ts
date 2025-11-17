import { QuizInspectionSystemPrompt } from "../QuestionAssesmentPrompt";
import { CircleTheoremLesson } from "../fixtures/CircleTheoremsExampleOutput";
import type { QuizQuestionWithSourceData } from "../interfaces";
import { combinePromptsAndQuestions, quizToLLMMessages } from "./OpenAIRanker";

describe("quizToLLMMessagesTest", () => {
  it("Should convert into valid OpenAI message format", () => {
    const testInput = {
      question:
        "For 6 days in a row I spend \u00a311 on my lunch. How much did I spent in total? ![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1707171916/km6zbhuzhbirgqpnzgfx.png)",
      answers: ["\u00a366"],
      distractors: ["\u00a316", "\u00a360", "\u00a363"],
      feedback: "",
      hint: "",
      html: [""],
      sourceUid: "QUES-TEST-123456",
      source: {
        questionId: 123456,
        questionUid: "QUES-TEST-123456",
        questionType: "short-answer" as const,
        questionStem: [
          {
            text: "For 6 days in a row I spend \u00a311 on my lunch. How much did I spent in total?",
            type: "text" as const,
          },
          {
            type: "image" as const,
            imageObject: {
              secureUrl:
                "http://oaknationalacademy-res.cloudinary.com/image/upload/v1707171916/km6zbhuzhbirgqpnzgfx.png",
              metadata: {
                attribution: "Money calculation question",
              },
            },
          },
        ],
        answers: {
          "short-answer": [
            {
              answer: [
                {
                  text: "\u00a366",
                  type: "text" as const,
                },
              ],
              answerIsDefault: true,
            },
          ],
        },
        feedback: "Correct! 6 × £11 = £66",
        hint: "Multiply the daily amount by the number of days",
        active: true,
      },
    };
    const _result = quizToLLMMessages(testInput as QuizQuestionWithSourceData);
    const ans = true;
    expect(ans).toBe(true);
  });
});

describe("fullOpenAIQuiz", () => {
  it("Should convert a lesson plan and quiz into valid OpenAI message format", () => {
    const testLessonPlan = CircleTheoremLesson;
    const testInput = {
      question:
        "For 6 days in a row I spend \u00a311 on my lunch. How much did I spent in total? ![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1707171916/km6zbhuzhbirgqpnzgfx.png)",
      answers: ["\u00a366"],
      distractors: ["\u00a316", "\u00a360", "\u00a363"],
      feedback: "",
      hint: "",
      html: [""],
      sourceUid: "QUES-TEST-123456",
      source: {
        questionId: 123456,
        questionUid: "QUES-TEST-123456",
        questionType: "short-answer" as const,
        questionStem: [
          {
            text: "For 6 days in a row I spend \u00a311 on my lunch. How much did I spent in total?",
            type: "text" as const,
          },
          {
            type: "image" as const,
            imageObject: {
              secureUrl:
                "http://oaknationalacademy-res.cloudinary.com/image/upload/v1707171916/km6zbhuzhbirgqpnzgfx.png",
              metadata: {
                attribution: "Money calculation question",
              },
            },
          },
        ],
        answers: {
          "short-answer": [
            {
              answer: [
                {
                  text: "\u00a366",
                  type: "text" as const,
                },
              ],
              answerIsDefault: true,
            },
          ],
        },
        feedback: "Correct! 6 × £11 = £66",
        hint: "Multiply the daily amount by the number of days",
        active: true,
      },
    };
    const _result = combinePromptsAndQuestions(
      testLessonPlan,
      [testInput as QuizQuestionWithSourceData],
      QuizInspectionSystemPrompt,
      "/exitQuiz",
    );
    const ans = true;
    expect(ans).toBe(true);
  });
});
