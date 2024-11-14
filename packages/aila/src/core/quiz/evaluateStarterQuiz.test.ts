import { CircleTheoremLesson } from "./CircleTheoremsExampleOutput";
import {
  DummyOpenAICall,
  OpenAICallReranker,
  combinePrompts,
  OpenAICallRerankerWithSchema,
  evaluateStarterQuiz,
} from "./OpenAIRanker";
import { parsedResponse } from "./OpenAIRanker";
import { starterQuizQuestionSuitabilityDescriptionSchema } from "./RerankerStructuredOutputSchema";

describe("Test OpenAI Image Reranker with online image and quiz questions", () => {
  jest.setTimeout(20000);
  it("Should return a valid response", async () => {
    const chatId = "test-chat-id";
    const userId = "test-user-id";
    const testLessonPlan = CircleTheoremLesson;
    const testInput = [
      {
        question:
          "For 6 days in a row I spend \u00a311 on my lunch. How much did I spent in total? ![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1707171916/km6zbhuzhbirgqpnzgfx.png)",
        answers: ["\u00a366"],
        distractors: ["\u00a316", "\u00a360", "\u00a363"],
        feedback: "",
        hint: "",
        html: [""],
      },
      {
        question:
          "For 6 days in a row I spend \u00a311 on my lunch. How much did I spent in total? ![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1707171916/km6zbhuzhbirgqpnzgfx.png)",
        answers: ["\u00a366"],
        distractors: ["\u00a316", "\u00a360", "\u00a363"],
        feedback: "",
        hint: "",
        html: [""],
      },
    ];
    const inputSchema = starterQuizQuestionSuitabilityDescriptionSchema;
    const response = await evaluateStarterQuiz(testLessonPlan, testInput);
    const parsed = parsedResponse(inputSchema, response);
    console.log(JSON.stringify(parsed));
    console.log(response);
    const ans = true;
    expect(ans).toBe(true);
  });
});
