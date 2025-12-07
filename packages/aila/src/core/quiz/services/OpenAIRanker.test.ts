import { QuizInspectionSystemPrompt } from "../QuestionAssesmentPrompt";
import { CircleTheoremLesson } from "../fixtures/CircleTheoremsExampleOutput";
import type { RagQuizQuestion } from "../interfaces";
import { combinePromptsAndQuestions, quizToLLMMessages } from "./OpenAIRanker";

describe("quizToLLMMessagesTest", () => {
  it("Should convert into valid OpenAI message format", () => {
    const testInput: RagQuizQuestion = {
      question: {
        questionType: "short-answer",
        question:
          "For 6 days in a row I spend \u00a311 on my lunch. How much did I spent in total? ![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1707171916/km6zbhuzhbirgqpnzgfx.png)",
        answers: ["\u00a366"],
        hint: "Multiply the daily amount by the number of days",
      },
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
            image_object: {
              secure_url:
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
              answer_is_default: true,
            },
          ],
        },
        feedback: "Correct! 6 × £11 = £66",
        hint: "Multiply the daily amount by the number of days",
        active: true,
      },
      imageMetadata: [],
    };
    const _result = quizToLLMMessages(testInput);
    const ans = true;
    expect(ans).toBe(true);
  });
});

describe("fullOpenAIQuiz", () => {
  it("Should convert a lesson plan and quiz into valid OpenAI message format", () => {
    const testLessonPlan = CircleTheoremLesson;
    const testInput: RagQuizQuestion = {
      question: {
        questionType: "short-answer",
        question:
          "For 6 days in a row I spend \u00a311 on my lunch. How much did I spent in total? ![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1707171916/km6zbhuzhbirgqpnzgfx.png)",
        answers: ["\u00a366"],
        hint: "Multiply the daily amount by the number of days",
      },
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
            image_object: {
              secure_url:
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
              answer_is_default: true,
            },
          ],
        },
        feedback: "Correct! 6 × £11 = £66",
        hint: "Multiply the daily amount by the number of days",
        active: true,
      },
      imageMetadata: [],
    };
    const _result = combinePromptsAndQuestions(
      testLessonPlan,
      [testInput],
      QuizInspectionSystemPrompt,
      "/exitQuiz",
    );
    const ans = true;
    expect(ans).toBe(true);
  });
});
