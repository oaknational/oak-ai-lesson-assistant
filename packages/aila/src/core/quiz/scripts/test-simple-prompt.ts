/**
 * Test simpler prompt for query generation
 *
 * Run with:
 *   pnpm --filter @oakai/aila with-env tsx src/core/quiz/scripts/test-simple-prompt.ts
 */
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

const PRIOR_KNOWLEDGE = [
  "I can identify and name parts of a circle including radius, diameter, chord, tangent, and arc.",
  "I can calculate angles in triangles and quadrilaterals.",
  "I understand that angles on a straight line sum to 180°.",
];

const KEY_LEARNING_POINTS = [
  "The angle at the centre is twice the angle at the circumference.",
  "Angles in the same segment are equal.",
  "The angle in a semicircle is 90°.",
  "Opposite angles of a cyclic quadrilateral sum to 180°.",
];

const SemanticSearchSchema = z.object({
  queries: z
    .array(z.string())
    .max(6)
    .describe("A list of semantic search queries"),
});

const STARTER_PROMPT_MINIMAL = `You are generating search queries to find quiz questions from a database. These queries will be used to find starter quiz questions that assess students' prior knowledge before a lesson on circle theorems.

Convert these statements into search queries. Output mathematical terms and concepts, not full sentences.

${PRIOR_KNOWLEDGE.map((pk, i) => `${i + 1}. ${pk}`).join("\n")}`;

const STARTER_PROMPT_WITH_CONTEXT = `You are generating search queries to find quiz questions from a database. These queries will be used to find starter quiz questions that assess students' prior knowledge before a Key Stage 4 maths lesson on circle theorems.

Learning outcome: I can apply circle theorems to solve problems involving angles in circles.

Convert these statements into search queries. Output mathematical terms and concepts, not full sentences.

${PRIOR_KNOWLEDGE.map((pk, i) => `${i + 1}. ${pk}`).join("\n")}`;

const EXIT_PROMPT_MINIMAL = `You are generating search queries to find quiz questions from a database. These queries will be used to find exit quiz questions that assess students' learning from a lesson on circle theorems.

Convert these statements into search queries. Output mathematical terms and concepts, not full sentences.

${KEY_LEARNING_POINTS.map((klp, i) => `${i + 1}. ${klp}`).join("\n")}`;

const EXIT_PROMPT_WITH_CONTEXT = `You are generating search queries to find quiz questions from a database. These queries will be used to find exit quiz questions that assess students' learning from a Key Stage 4 maths lesson on circle theorems.

Learning outcome: I can apply circle theorems to solve problems involving angles in circles.

Convert these statements into search queries. Output mathematical terms and concepts, not full sentences.

${KEY_LEARNING_POINTS.map((klp, i) => `${i + 1}. ${klp}`).join("\n")}`;

async function testPrompt(
  openai: OpenAI,
  model: string,
  prompt: string,
  promptName: string,
  runs: number,
) {
  console.log(`\n=== ${model} with ${promptName} ===`);

  for (let i = 0; i < runs; i++) {
    const start = Date.now();

    const response = await openai.beta.chat.completions.parse({
      model,
      messages: [{ role: "user", content: prompt }],
      response_format: zodResponseFormat(
        SemanticSearchSchema,
        "SemanticSearchQueries",
      ),
      max_completion_tokens: 500,
    });

    const elapsed = Date.now() - start;
    const parsed = response.choices[0]?.message?.parsed;

    console.log(`\nRun ${i + 1} (${elapsed}ms):`);
    parsed?.queries.forEach((q, j) => console.log(`  ${j + 1}. ${q}`));
  }
}

async function main() {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  console.log("=== Prior Knowledge (for starter quiz) ===");
  PRIOR_KNOWLEDGE.forEach((pk, i) => console.log(`  ${i + 1}. ${pk}`));

  console.log("\n=== Key Learning Points (for exit quiz) ===");
  KEY_LEARNING_POINTS.forEach((klp, i) => console.log(`  ${i + 1}. ${klp}`));

  console.log("\n\n========== STARTER QUIZ COMPARISON ==========\n");

  await testPrompt(
    openai,
    "gpt-4.1-nano",
    STARTER_PROMPT_MINIMAL,
    "Starter (minimal)",
    3,
  );
  await testPrompt(
    openai,
    "gpt-4.1-nano",
    STARTER_PROMPT_WITH_CONTEXT,
    "Starter (with context)",
    3,
  );

  console.log("\n\n========== EXIT QUIZ COMPARISON ==========\n");

  await testPrompt(
    openai,
    "gpt-4.1-nano",
    EXIT_PROMPT_MINIMAL,
    "Exit (minimal)",
    3,
  );
  await testPrompt(
    openai,
    "gpt-4.1-nano",
    EXIT_PROMPT_WITH_CONTEXT,
    "Exit (with context)",
    3,
  );
}

main().catch(console.error);
