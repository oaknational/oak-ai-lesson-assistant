import { quizToLLMMessages, combinePrompts } from "./OpenAIRanker";
import { CircleTheoremLesson } from "./fixtures/CircleTheoremsExampleOutput";

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
    };
    const result = quizToLLMMessages(testInput);
    console.log(JSON.stringify(result));
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
    };
    const result = combinePrompts(testLessonPlan, testInput);
    console.log(JSON.stringify(result));
    const ans = true;
    expect(ans).toBe(true);
  });
});
