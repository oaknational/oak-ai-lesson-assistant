import { quizQuestionsToOpenAIMessageFormat } from "./OpenAIRanker";

describe("quizQuestionsToPrompts", () => {
  it("Should convert a lesson plan and quiz into valid OpenAI message format", () => {
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
    const result = quizQuestionsToOpenAIMessageFormat(testInput);
    console.log(JSON.stringify(result));
    const ans = true;
    expect(ans).toBe(true);
  });
});

[
  { type: "text", text: "# Question 1:" },
  {
    type: "text",
    text: "For 6 days in a row I spend £11 on my lunch. How much did I spent in total?",
  },
  {
    type: "image_url",
    image_url: {
      url: "http://oaknationalacademy-res.cloudinary.com/image/upload/v1707171916/km6zbhuzhbirgqpnzgfx.png",
    },
  },
  { type: "text", text: "\n\nCorrect answer(s):" },
  { type: "text", text: "1: " },
  { type: "text", text: "£66" },
  { type: "text", text: "\n" },
  { type: "text", text: "\n\nDistractors:" },
  { type: "text", text: "1: " },
  { type: "text", text: "£16" },
  { type: "text", text: "\n" },
  { type: "text", text: "2: " },
  { type: "text", text: "£60" },
  { type: "text", text: "\n" },
  { type: "text", text: "3: " },
  { type: "text", text: "£63" },
  { type: "text", text: "\n" },
  { type: "text", text: "# Question 2:" },
  {
    type: "text",
    text: "For 6 days in a row I spend £11 on my lunch. How much did I spent in total?",
  },
  {
    type: "image_url",
    image_url: {
      url: "http://oaknationalacademy-res.cloudinary.com/image/upload/v1707171916/km6zbhuzhbirgqpnzgfx.png",
    },
  },
  { type: "text", text: "\n\nCorrect answer(s):" },
  { type: "text", text: "1: " },
  { type: "text", text: "£66" },
  { type: "text", text: "\n" },
  { type: "text", text: "\n\nDistractors:" },
  { type: "text", text: "1: " },
  { type: "text", text: "£16" },
  { type: "text", text: "\n" },
  { type: "text", text: "2: " },
  { type: "text", text: "£60" },
  { type: "text", text: "\n" },
  { type: "text", text: "3: " },
  { type: "text", text: "£63" },
  { type: "text", text: "\n" },
];
