import { aiLogger } from "@oakai/logger";

import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

import type { PartialLessonPlan, QuizPath } from "../../../protocol/schema";
import { unpackLessonPlanForPrompt } from "../unpackLessonPlan";

const log = aiLogger("aila:quiz");

const SemanticSearchSchema = z.object({
  queries: z.array(z.string()).describe("A list of semantic search queries"),
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
    maxQueries: number = 3,
  ): Promise<z.infer<typeof SemanticSearchSchema>> {
    const unpackedContent = unpackLessonPlanForPrompt(lessonPlan);

    const prompt = `Based on the following lesson plan content, generate semantic search queries to find relevant questions from a UK mathematics quiz question database.

IMPORTANT: You are searching a database of quiz questions, so queries should be semantic concepts and topics, NOT meta-descriptions like "quiz questions about X" or "assessing knowledge of Y".

The search queries should:
- Be concise semantic concepts and topics (e.g., "circle radius diameter circumference" not "quiz questions on circles")
- Focus on key mathematical concepts and learning outcomes
- Use educational terminology appropriate for the subject and key stage
- Be specific enough to find relevant questions but broad enough to capture variations
- Include different question types (knowledge, understanding, application)
- Consider prerequisite knowledge and common misconceptions

Lesson plan content:
${unpackedContent}

You should generate queries for a ${quizType} quiz. ${this.quizSpecificInstruction(quizType, lessonPlan)}

Generate a list of 1-${maxQueries} semantic search queries`;

    try {
      const response = await this.openai.beta.chat.completions.parse({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: zodResponseFormat(
          SemanticSearchSchema,
          "SemanticSearchQueries",
        ),
        max_completion_tokens: 1000,
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

  private quizSpecificInstruction(
    quizType: QuizPath,
    lessonPlan: PartialLessonPlan,
  ): string {
    if (quizType === "/starterQuiz") {
      const priorKnowledge = lessonPlan.priorKnowledge ?? [];
      const priorKnowledgeList =
        priorKnowledge.length > 0
          ? `\n\nPrior knowledge items to focus on:\n${priorKnowledge.map((item, i) => `${i + 1}. ${item}`).join("\n")}`
          : "";

      return `The purpose of the starter quiz is to assess the prior knowledge of the students, identify misconceptions, and reactivate prior knowledge. Please consider alignment with the "prior knowledge" section of the lesson plan.${priorKnowledgeList}`;
    } else if (quizType === "/exitQuiz") {
      const keyLearningPoints = lessonPlan.keyLearningPoints ?? [];
      const learningPointsList =
        keyLearningPoints.length > 0
          ? `\n\nKey learning points to focus on:\n${keyLearningPoints.map((item, i) => `${i + 1}. ${item}`).join("\n")}`
          : "";

      return `The purpose of the exit quiz is to assess the learning outcomes of the students, identify misconceptions, and consolidate the learning. Please consider alignment with the "key learning points" and "learning outcome" sections of the lesson plan.${learningPointsList}`;
    }
    throw new Error(`Unsupported quiz type: ${quizType as string}`);
  }
}
