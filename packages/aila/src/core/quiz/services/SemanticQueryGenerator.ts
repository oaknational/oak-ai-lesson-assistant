import { aiLogger } from "@oakai/logger";

import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

import type { PartialLessonPlan, QuizPath } from "../../../protocol/schema";

const log = aiLogger("aila:quiz");

const SemanticSearchSchema = z.object({
  queries: z
    .array(z.string())
    .max(6)
    .describe("A list of semantic search queries"),
});

function buildLessonContext(lessonPlan: PartialLessonPlan): string {
  const lines: string[] = [];
  if (lessonPlan.title) lines.push(`Title: ${lessonPlan.title}`);
  if (lessonPlan.subject) lines.push(`Subject: ${lessonPlan.subject}`);
  if (lessonPlan.keyStage) lines.push(`Key Stage: ${lessonPlan.keyStage}`);
  if (lessonPlan.learningOutcome)
    lines.push(`Learning Outcome: ${lessonPlan.learningOutcome}`);
  return lines.join("\n");
}

export class SemanticQueryGenerator {
  private readonly openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  public async generateSemanticSearchQueries(
    lessonPlan: PartialLessonPlan,
    quizType: QuizPath,
  ): Promise<z.infer<typeof SemanticSearchSchema>> {
    const isStarter = quizType === "/starterQuiz";
    const items = isStarter
      ? (lessonPlan.priorKnowledge ?? [])
      : (lessonPlan.keyLearningPoints ?? []);

    const prompt = this.buildPrompt(lessonPlan, quizType, items);

    try {
      const response = await this.openai.beta.chat.completions.parse({
        model: "gpt-4.1-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: zodResponseFormat(
          SemanticSearchSchema,
          "SemanticSearchQueries",
        ),
        max_completion_tokens: 500,
      });

      const parsedContent = response.choices[0]?.message?.parsed;
      if (!parsedContent) {
        throw new Error("Failed to parse semantic search queries");
      }

      log.info(
        `Generated ${parsedContent.queries.length} semantic search queries for ${quizType}`,
      );
      return parsedContent;
    } catch (error) {
      log.error("Failed to generate semantic search queries:", error);
      throw new Error(
        "Failed to generate semantic search queries from lesson plan",
      );
    }
  }

  private buildPrompt(
    lessonPlan: PartialLessonPlan,
    quizType: QuizPath,
    items: string[],
  ): string {
    const isStarter = quizType === "/starterQuiz";
    const lessonContext = buildLessonContext(lessonPlan);
    const itemsList = items.map((item, i) => `${i + 1}. ${item}`).join("\n");

    const quizDescription = isStarter
      ? "a starter quiz assessing prior knowledge before the lesson"
      : "an exit quiz assessing learning after the lesson";

    return `Generate at least ${items.length} hybrid semantic search queries to find questions for ${quizDescription}.

Lesson context:
${lessonContext}

Convert these ${isStarter ? "prior knowledge statements" : "learning points"} into search queries.

Guidelines:
- Output concise concepts (e.g., "identify circle radius diameter chord" not "quiz questions about circles")
- Include an action verb (identify, calculate, recall) - it helps match question types
- Synonymous verbs like "identify and name" or "recall and remember" can be collapsed to one
- Split into multiple queries when concepts are genuinely distinct (e.g., "triangles" vs "quadrilaterals")

${itemsList}`;
  }
}
