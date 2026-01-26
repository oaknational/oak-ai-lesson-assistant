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
    const title = lessonPlan.title ?? "this lesson";

    const isStarter = quizType === "/starterQuiz";
    const items = isStarter
      ? (lessonPlan.priorKnowledge ?? [])
      : (lessonPlan.keyLearningPoints ?? []);
    const quizPurpose = isStarter
      ? "starter quiz questions that assess students' prior knowledge"
      : "exit quiz questions that assess students' learning";

    const itemsList = items.map((item, i) => `${i + 1}. ${item}`).join("\n");

    const prompt = `You are generating search queries to find quiz questions from a database. These queries will be used to find ${quizPurpose} for a lesson on ${title}.

Convert these statements into search queries. Output mathematical terms and concepts, not full sentences.

${itemsList}`;

    try {
      const response = await this.openai.beta.chat.completions.parse({
        model: "gpt-4.1-nano",
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
}
