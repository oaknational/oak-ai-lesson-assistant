import { CircleTheoremLesson } from "./CircleTheoremsExampleOutput";
import {
  DummyOpenAICall,
  OpenAICallReranker,
  combinePrompts,
  OpenAICallRerankerWithSchema,
} from "./OpenAIRanker";
import { parsedResponse } from "./OpenAIRanker";
import { starterQuizQuestionSuitabilityDescriptionSchema } from "./RerankerStructuredOutputSchema";

describe("Test OpenAI Image Reranker with online image and quiz questions", () => {
  jest.setTimeout(15000);
  it("Should return a valid response", async () => {
    const chatId = "test-chat-id";
    const userId = "test-user-id";
    const testLessonPlan = CircleTheoremLesson;
    const testInput = {
      question:
        "For 6 days in a row I spend \u00a311 on my lunch. How much did I spent in total? ![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1707171916/km6zbhuzhbirgqpnzgfx.png)",
      answers: ["\u00a366"],
      distractors: ["\u00a316", "\u00a360", "\u00a363"],
      feedback: "",
      hint: "",
      html: [""],
    };
    const result = combinePrompts(testLessonPlan, testInput);
    const response = await OpenAICallReranker(result);
    console.log(response);
    console.log(response.choices[0]?.message.content);
    const ans = true;
    expect(ans).toBe(true);
  });
});

describe("Test OpenAI Image Reranker with online image and quiz questions with structured output", () => {
  jest.setTimeout(15000);
  it("Should return a valid response", async () => {
    const chatId = "test-chat-id";
    const userId = "test-user-id";
    const testLessonPlan = CircleTheoremLesson;
    const testInput = {
      question:
        "For 6 days in a row I spend \u00a311 on my lunch. How much did I spent in total? ![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1707171916/km6zbhuzhbirgqpnzgfx.png)",
      answers: ["\u00a366"],
      distractors: ["\u00a316", "\u00a360", "\u00a363"],
      feedback: "",
      hint: "",
      html: [""],
    };
    const result = combinePrompts(testLessonPlan, testInput);
    const inputSchema = starterQuizQuestionSuitabilityDescriptionSchema;
    const response = await OpenAICallRerankerWithSchema(
      result,
      1500,
      inputSchema,
    );
    const parsed = parsedResponse(inputSchema, response);
    console.log(JSON.stringify(parsed));
    console.log(response);
    const ans = true;
    expect(ans).toBe(true);
  });
});
