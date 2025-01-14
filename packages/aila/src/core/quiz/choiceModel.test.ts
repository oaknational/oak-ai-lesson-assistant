import type { QuizPath } from "../../protocol/schema";
import { AilaQuiz } from "./AilaQuiz";
import { selectHighestRated } from "./ChoiceModels";
import { CircleTheoremLesson } from "./fixtures/CircleTheoremsExampleOutput";
import type { TestRating } from "./rerankers/RerankerStructuredOutputSchema";
import { testRatingSchema } from "./rerankers/RerankerStructuredOutputSchema";

const testRatingArray: TestRating[] = [
  {
    rating: 0.2,
    justification: "Justification 1",
  },
  {
    rating: 0.8,
    justification: "Justification 2",
  },
  {
    rating: 0.5,
    justification: "Justification 3",
  },
];

describe("Tests Simple Rating function", () => {
  it("it should rate the second index highest", () => {});
  const highestRatedIndex = selectHighestRated(
    testRatingArray,
    (item) => item.rating,
  );
  expect(highestRatedIndex).toBe(1);
});

describe("Tests LLM rating with structured rating object", () => {
  jest.setTimeout(30000);
  it("it should return a valid rating index that is zero", async () => {
    const quiz = new AilaQuiz();
    const planIDHashes = ["aLaUYjYaq6HGN_ttldQUl", "aLaUYjYaq6HGN_ttldQUl"];
    const lessonPlan = CircleTheoremLesson;
    const inputSchema = testRatingSchema;
    const ratingIndex = await quiz.planIdsToStarterQuizRatings(
      planIDHashes,
      lessonPlan,
      inputSchema,
    );
    expect(ratingIndex).toBeDefined();
    expect(ratingIndex === 0);
  });
});

describe("Tests planIdsToQuizRatings function", () => {
  jest.setTimeout(30000);
  it("should return a valid rating index for exit quiz", async () => {
    const quiz = new AilaQuiz();
    const planIDHashes = ["aLaUYjYaq6HGN_ttldQUl", "aLaUYjYaq6HGN_ttldQUl"];
    const lessonPlan = CircleTheoremLesson;
    const inputSchema = testRatingSchema;
    const quizType: QuizPath = "/exitQuiz";

    const ratingIndex = await quiz.planIdsToQuizRatings(
      planIDHashes,
      lessonPlan,
      inputSchema,
      quizType,
    );

    expect(ratingIndex).toBeDefined();
    expect(typeof ratingIndex).toBe("number");
    expect(ratingIndex).toBeGreaterThanOrEqual(0);
    expect(ratingIndex).toBeLessThan(planIDHashes.length);
  });
});

// Example OpenAI Message
// [
//   {
//     role: "system",
//     content:
//       "Given a lesson plan with prior knowledge requirements and key learning points, along with a proposed assessment Quiz, rate the question's effectiveness on a scale of 1-10 (1 being least effective, 10 being most effective) based on the following criteria:\n\n1. Relevance to Prior Knowledge:\n   - How well does the question address the specific prior knowledge outlined in the lesson plan?\n   - Does it effectively probe the depth of understanding of prerequisite concepts?\n\n2. Alignment with Key Learning Points:\n   - To what extent does the question target the main learning objectives of the lesson?\n   - Does it require students to demonstrate understanding of the core concepts?\n\n3. Cognitive Level:\n   - Does the question match the appropriate level of thinking (e.g., recall, application, analysis) for the lesson's objectives?\n   - Does it challenge students to think critically or merely recall information?\n\n4. Clarity and Specificity:\n   - Is the question clear and unambiguous?\n   - Does it focus on specific knowledge or skills rather than being overly broad?\n\n5. Potential for Insight:\n   - Will the answers to this question provide valuable information about students' understanding and potential misconceptions?\n   - Can it help identify gaps in knowledge that need to be addressed during the lesson?\n\nProvide a numerical rating for each criterion and an overall rating. Justify your ratings with brief explanations, highlighting strengths and areas for improvement in the question.",
//   },
//   {
//     role: "user",
//     content: [
//       {
//         type: "text",
//         text: "#Prior Knowledge \nThe below is the prior knowledge for the lesson in which the question is being assessed as part of a starter Quiz for the lesson. Please consider how well the question aligns with this prior knowledge.\nUnderstanding of basic geometric shapes and their properties.\nFamiliarity with the concept of a circle, including radius, diameter, and circumference.\nKnowledge of angles and how to measure them.\nAbility to perform basic algebraic manipulations.\nUnderstanding of congruence and similarity in geometric figures.",
//       },
//       { type: "text", text: "# Question 1:\n" },
//       {
//         type: "text",
//         text: "What is the sum of the interior angles in this regular octagon?",
//       },
//       {
//         type: "image_url",
//         image_url: {
//           url: "http://oaknationalacademy-res.cloudinary.com/image/upload/v1707206543/sqggawtqlhmxjkd0vezg.png",
//         },
//       },
//       { type: "text", text: "\n\nCorrect answer(s):" },
//       { type: "text", text: "1: " },
//       { type: "text", text: "1080°" },
//       { type: "text", text: "\n" },
//       { type: "text", text: "\n\nDistractors:" },
//       { type: "text", text: "1: " },
//       { type: "text", text: "135°" },
//       { type: "text", text: "\n" },
//       { type: "text", text: "2: " },
//       { type: "text", text: "1800°" },
//       { type: "text", text: "\n" },
//       { type: "text", text: "3: " },
//       { type: "text", text: "225°" },
//       { type: "text", text: "\n" },
//       { type: "text", text: "# Question 2:\n" },
//       {
//         type: "text",
//         text: "What is the size of one interior angle in this regular octagon?",
//       },
//       {
//         type: "image_url",
//         image_url: {
//           url: "http://oaknationalacademy-res.cloudinary.com/image/upload/v1707206568/k2odfrvqnpgkkwy9qffr.png",
//         },
//       },
//       { type: "text", text: "\n\nCorrect answer(s):" },
//       { type: "text", text: "1: " },
//       { type: "text", text: "135°" },
//       { type: "text", text: "\n" },
//       { type: "text", text: "\n\nDistractors:" },
//       { type: "text", text: "1: " },
//       { type: "text", text: "1080°" },
//       { type: "text", text: "\n" },
//       { type: "text", text: "2: " },
//       { type: "text", text: "120°" },
//       { type: "text", text: "\n" },
//       { type: "text", text: "3: " },
//       { type: "text", text: "225°" },
//       { type: "text", text: "\n" },
//       { type: "text", text: "# Question 3:\n" },
//       { type: "text", text: "What is the bearing of B from A?" },
//       {
//         type: "image_url",
//         image_url: {
//           url: "http://oaknationalacademy-res.cloudinary.com/image/upload/v1707206570/q0qdovegyveuzz1agxvw.png",
//         },
//       },
//       { type: "text", text: "\n\nCorrect answer(s):" },
//       { type: "text", text: "1: " },
//       { type: "text", text: "090°" },
//       { type: "text", text: "\n" },
//       { type: "text", text: "\n\nDistractors:" },
//       { type: "text", text: "1: " },
//       { type: "text", text: "045°" },
//       { type: "text", text: "\n" },
//       { type: "text", text: "2: " },
//       { type: "text", text: "135°" },
//       { type: "text", text: "\n" },
//       { type: "text", text: "3: " },
//       { type: "text", text: "270°" },
//       { type: "text", text: "\n" },
//       { type: "text", text: "# Question 4:\n" },
//       { type: "text", text: "What is the bearing of A from B?" },
//       {
//         type: "image_url",
//         image_url: {
//           url: "http://oaknationalacademy-res.cloudinary.com/image/upload/v1707206588/u9bjof2bluyk8bguna8v.png",
//         },
//       },
//       { type: "text", text: "\n\nCorrect answer(s):" },
//       { type: "text", text: "1: " },
//       { type: "text", text: "270°" },
//       { type: "text", text: "\n" },
//       { type: "text", text: "\n\nDistractors:" },
//       { type: "text", text: "1: " },
//       { type: "text", text: "045°" },
//       { type: "text", text: "\n" },
//       { type: "text", text: "2: " },
//       { type: "text", text: "090°" },
//       { type: "text", text: "\n" },
//       { type: "text", text: "3: " },
//       { type: "text", text: "135°" },
//       { type: "text", text: "\n" },
//       { type: "text", text: "# Question 5:\n" },
//       { type: "text", text: "What is the bearing of D from E?" },
//       {
//         type: "image_url",
//         image_url: {
//           url: "http://oaknationalacademy-res.cloudinary.com/image/upload/v1707206603/y4abeekxjg252tzpo8ot.png",
//         },
//       },
//       { type: "text", text: "\n\nCorrect answer(s):" },
//       { type: "text", text: "1: " },
//       { type: "text", text: "045°" },
//       { type: "text", text: "\n" },
//       { type: "text", text: "\n\nDistractors:" },
//       { type: "text", text: "1: " },
//       { type: "text", text: "090°" },
//       { type: "text", text: "\n" },
//       { type: "text", text: "2: " },
//       { type: "text", text: "135°" },
//       { type: "text", text: "\n" },
//       { type: "text", text: "3: " },
//       { type: "text", text: "270°" },
//       { type: "text", text: "\n" },
//       { type: "text", text: "# Question 6:\n" },
//       { type: "text", text: "What is the bearing of G from F?" },
//       {
//         type: "image_url",
//         image_url: {
//           url: "http://oaknationalacademy-res.cloudinary.com/image/upload/v1707206605/fntmyjjn03b875btrkzz.png",
//         },
//       },
//       { type: "text", text: "\n\nCorrect answer(s):" },
//       { type: "text", text: "1: " },
//       { type: "text", text: "135°" },
//       { type: "text", text: "\n" },
//       { type: "text", text: "\n\nDistractors:" },
//       { type: "text", text: "1: " },
//       { type: "text", text: "045°" },
//       { type: "text", text: "\n" },
//       { type: "text", text: "2: " },
//       { type: "text", text: "225°" },
//       { type: "text", text: "\n" },
//       { type: "text", text: "3: " },
//       { type: "text", text: "315°" },
//       { type: "text", text: "\n" },
//     ],
//   },),
// ];
