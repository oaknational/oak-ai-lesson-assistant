/**
 * Test gpt-4.1-nano query quality
 *
 * Run with:
 *   pnpm --filter @oakai/aila with-env tsx src/core/quiz/scripts/test-nano-quality.ts
 */
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

const TEST_LESSON_PLAN = {
  title: "Circle theorems",
  subject: "maths",
  keyStage: "key-stage-4",
  topic: "Circle theorems",
  learningOutcome:
    "I can apply circle theorems to solve problems involving angles in circles.",
  priorKnowledge: [
    "I can identify and name parts of a circle including radius, diameter, chord, tangent, and arc.",
    "I can calculate angles in triangles and quadrilaterals.",
    "I understand that angles on a straight line sum to 180°.",
  ],
  keyLearningPoints: [
    "The angle at the centre is twice the angle at the circumference.",
    "Angles in the same segment are equal.",
    "The angle in a semicircle is 90°.",
    "Opposite angles of a cyclic quadrilateral sum to 180°.",
  ],
};

const SemanticSearchSchema = z.object({
  queries: z.array(z.string()).describe("A list of semantic search queries"),
});

function buildPrompt() {
  const priorKnowledge = TEST_LESSON_PLAN.priorKnowledge
    .map((pk, i) => `${i + 1}. ${pk}`)
    .join("\n");

  return `Based on the following lesson plan content, generate semantic search queries to find relevant questions from a UK mathematics quiz question database.

IMPORTANT: You are searching a database of quiz questions, so queries should be semantic concepts and topics, NOT meta-descriptions like "quiz questions about X" or "assessing knowledge of Y".

The search queries should:
- Be concise semantic concepts and topics (e.g., "circle radius diameter circumference" not "quiz questions on circles")
- Focus on key mathematical concepts and learning outcomes
- Use educational terminology appropriate for the subject and key stage
- Be specific enough to find relevant questions but broad enough to capture variations
- Include different question types (knowledge, understanding, application)
- Consider prerequisite knowledge and common misconceptions

Lesson plan content:
Title: ${TEST_LESSON_PLAN.title}
Subject: ${TEST_LESSON_PLAN.subject}
Key Stage: ${TEST_LESSON_PLAN.keyStage}
Topic: ${TEST_LESSON_PLAN.topic}
Learning Outcome: ${TEST_LESSON_PLAN.learningOutcome}

Prior Knowledge:
${priorKnowledge}

You should generate queries for a /starterQuiz quiz. The purpose of the starter quiz is to assess the prior knowledge of the students, identify misconceptions, and reactivate prior knowledge. Please consider alignment with the "prior knowledge" section of the lesson plan.

Prior knowledge items to focus on:
${priorKnowledge}

Generate a list of 1-6 semantic search queries`;
}

async function main() {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const runs = 10;
  const prompt = buildPrompt();

  console.log("=== Prior Knowledge (what queries should cover) ===");
  TEST_LESSON_PLAN.priorKnowledge.forEach((pk, i) =>
    console.log(`  ${i + 1}. ${pk}`),
  );

  console.log("\n=== Key Learning Points (should NOT appear in queries) ===");
  TEST_LESSON_PLAN.keyLearningPoints.forEach((klp, i) =>
    console.log(`  ${i + 1}. ${klp}`),
  );

  console.log("\n=== Running 10 tests with gpt-4.1-nano ===\n");

  for (let i = 0; i < runs; i++) {
    const start = Date.now();

    const response = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: zodResponseFormat(
        SemanticSearchSchema,
        "SemanticSearchQueries",
      ),
      max_completion_tokens: 1000,
    });

    const elapsed = Date.now() - start;
    const parsed = response.choices[0]?.message?.parsed;

    console.log(
      `Run ${i + 1} (${elapsed}ms) - ${parsed?.queries.length ?? 0} queries:`,
    );
    parsed?.queries.forEach((q, j) => console.log(`  ${j + 1}. ${q}`));
    console.log("");
  }
}

main().catch(console.error);
