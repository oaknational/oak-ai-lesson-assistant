import { CircleTheoremLesson } from "./CircleTheoremsExampleOutput";
import { quizToLLMMessages, combinePrompts } from "./OpenAIRanker";

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

// [
//   {
//     role: "user",
//     content: [
//       {
//         type: "text",
//         text: "For 6 days in a row I spend £11 on my lunch. How much did I spent in total?",
//       },
//       {
//         type: "image_url",
//         image_url: {
//           url: "http://oaknationalacademy-res.cloudinary.com/image/upload/v1707171916/km6zbhuzhbirgqpnzgfx.png",
//         },
//       },
//       { type: "text", text: "\n\nCorrect answer(s):" },
//       { type: "text", text: "£66" },
//       { type: "text", text: "\n\nDistractors:" },
//       { type: "text", text: "£16" },
//       { type: "text", text: "£60" },
//       { type: "text", text: "£63" },
//     ],
//   },
// ];
// [
//   {
//     role: "system",
//     content:
//       "Given a lesson plan with prior knowledge requirements and key learning points, along with a proposed assessment question, rate the question's effectiveness on a scale of 1-10 (1 being least effective, 10 being most effective) based on the following criteria:\n\n1. Relevance to Prior Knowledge:\n   - How well does the question address the specific prior knowledge outlined in the lesson plan?\n   - Does it effectively probe the depth of understanding of prerequisite concepts?\n\n2. Alignment with Key Learning Points:\n   - To what extent does the question target the main learning objectives of the lesson?\n   - Does it require students to demonstrate understanding of the core concepts?\n\n3. Cognitive Level:\n   - Does the question match the appropriate level of thinking (e.g., recall, application, analysis) for the lesson's objectives?\n   - Does it challenge students to think critically or merely recall information?\n\n4. Clarity and Specificity:\n   - Is the question clear and unambiguous?\n   - Does it focus on specific knowledge or skills rather than being overly broad?\n\n5. Potential for Insight:\n   - Will the answers to this question provide valuable information about students' understanding and potential misconceptions?\n   - Can it help identify gaps in knowledge that need to be addressed during the lesson?\n\nProvide a numerical rating for each criterion and an overall rating. Justify your ratings with brief explanations, highlighting strengths and areas for improvement in the question.",
//   },
//   {
//     role: "user",
//     content: [
//       {
//         type: "text",
//         text: "Understanding of basic geometric shapes and their properties.\nFamiliarity with the concept of a circle, including radius, diameter, and circumference.\nKnowledge of angles and how to measure them.\nAbility to perform basic algebraic manipulations.\nUnderstanding of congruence and similarity in geometric figures.",
//       },
//       {
//         type: "text",
//         text: "For 6 days in a row I spend £11 on my lunch. How much did I spent in total?",
//       },
//       {
//         type: "image_url",
//         image_url: {
//           url: "http://oaknationalacademy-res.cloudinary.com/image/upload/v1707171916/km6zbhuzhbirgqpnzgfx.png",
//         },
//       },
//       { type: "text", text: "\n\nCorrect answer(s):" },
//       { type: "text", text: "1: " },
//       { type: "text", text: "£66" },
//       { type: "text", text: "\n" },
//       { type: "text", text: "\n\nDistractors:" },
//       { type: "text", text: "1: " },
//       { type: "text", text: "£16" },
//       { type: "text", text: "\n" },
//       { type: "text", text: "2: " },
//       { type: "text", text: "£60" },
//       { type: "text", text: "\n" },
//       { type: "text", text: "3: " },
//       { type: "text", text: "£63" },
//       { type: "text", text: "\n" },
//     ],
//   },
// ];
