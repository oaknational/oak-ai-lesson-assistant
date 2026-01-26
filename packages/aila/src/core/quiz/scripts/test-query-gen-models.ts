/**
 * Compare query generation speed between models
 *
 * Run with:
 *   pnpm --filter @oakai/aila with-env tsx src/core/quiz/scripts/test-query-gen-models.ts
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

async function testModel(openai: OpenAI, model: string, runs: number) {
  const prompt = buildPrompt();
  const times: number[] = [];
  const results: string[][] = [];

  for (let i = 0; i < runs; i++) {
    const start = Date.now();

    const response = await openai.beta.chat.completions.parse({
      model,
      messages: [{ role: "user", content: prompt }],
      response_format: zodResponseFormat(
        SemanticSearchSchema,
        "SemanticSearchQueries",
      ),
      max_completion_tokens: 1000,
    });

    const elapsed = Date.now() - start;
    times.push(elapsed);

    const parsed = response.choices[0]?.message?.parsed;
    if (parsed) {
      results.push(parsed.queries);
    }

    console.log(
      `  Run ${i + 1}: ${elapsed}ms (${parsed?.queries.length ?? 0} queries)`,
    );
  }

  return { times, results };
}

async function main() {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const runs = 5;

  console.log("=== Testing gpt-4o-mini ===");
  const gpt4oMini = await testModel(openai, "gpt-4o-mini", runs);

  console.log("\n=== Testing gpt-4.1-mini ===");
  const gpt41Mini = await testModel(openai, "gpt-4.1-mini", runs);

  console.log("\n=== Testing gpt-4.1-nano ===");
  const gpt41Nano = await testModel(openai, "gpt-4.1-nano", runs);

  // Calculate stats
  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const min = (arr: number[]) => Math.min(...arr);
  const max = (arr: number[]) => Math.max(...arr);

  console.log("\n=== RESULTS ===");
  console.log("\ngpt-4o-mini:");
  console.log(`  Avg: ${avg(gpt4oMini.times).toFixed(0)}ms`);
  console.log(`  Min: ${min(gpt4oMini.times)}ms`);
  console.log(`  Max: ${max(gpt4oMini.times)}ms`);
  console.log(
    `  Queries: ${gpt4oMini.results.map((r) => r.length).join(", ")}`,
  );

  console.log("\ngpt-4.1-mini:");
  console.log(`  Avg: ${avg(gpt41Mini.times).toFixed(0)}ms`);
  console.log(`  Min: ${min(gpt41Mini.times)}ms`);
  console.log(`  Max: ${max(gpt41Mini.times)}ms`);
  console.log(
    `  Queries: ${gpt41Mini.results.map((r) => r.length).join(", ")}`,
  );

  console.log("\ngpt-4.1-nano:");
  console.log(`  Avg: ${avg(gpt41Nano.times).toFixed(0)}ms`);
  console.log(`  Min: ${min(gpt41Nano.times)}ms`);
  console.log(`  Max: ${max(gpt41Nano.times)}ms`);
  console.log(
    `  Queries: ${gpt41Nano.results.map((r) => r.length).join(", ")}`,
  );

  // Show sample queries from each
  console.log("\n=== Sample Queries (last run) ===");
  console.log("\ngpt-4o-mini:");
  gpt4oMini.results[gpt4oMini.results.length - 1]?.forEach((q, i) =>
    console.log(`  ${i + 1}. ${q}`),
  );

  console.log("\ngpt-4.1-mini:");
  gpt41Mini.results[gpt41Mini.results.length - 1]?.forEach((q, i) =>
    console.log(`  ${i + 1}. ${q}`),
  );

  console.log("\ngpt-4.1-nano:");
  gpt41Nano.results[gpt41Nano.results.length - 1]?.forEach((q, i) =>
    console.log(`  ${i + 1}. ${q}`),
  );
}

main().catch(console.error);
