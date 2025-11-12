// ML-based Quiz Generator - Multi-Term approach
// Independent semantic search per learning goal
import { aiLogger } from "@oakai/logger";

import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

import type { PartialLessonPlan, QuizPath } from "../../../protocol/schema";
import type { QuizQuestionPool } from "../interfaces";
import { unpackLessonPlanForPrompt } from "../unpackLessonPlan";
import { MLQuizGenerator } from "./MLQuizGenerator";

const log = aiLogger("aila:quiz");

const SemanticSearchSchema = z.object({
  queries: z.array(z.string()).describe("A list of semantic search queries"),
});

// Number of results to retrieve from Elasticsearch before reranking
const SEARCH_SIZE = 50;

// Number of candidates to keep per pool after Cohere reranking
const POOL_SIZE = 3;

function quizSpecificInstruction(
  quizType: QuizPath,
  lessonPlan: PartialLessonPlan,
) {
  if (quizType === "/starterQuiz") {
    const priorKnowledge = lessonPlan.priorKnowledge || [];
    const priorKnowledgeList =
      priorKnowledge.length > 0
        ? `\n\nPrior knowledge items to focus on:\n${priorKnowledge.map((item, i) => `${i + 1}. ${item}`).join("\n")}`
        : "";

    return `The purpose of the starter quiz is to assess the prior knowledge of the students, identify misconceptions, and reactivate prior knowledge. Please consider alignment with the "prior knowledge" section of the lesson plan.${priorKnowledgeList}`;
  } else if (quizType === "/exitQuiz") {
    const keyLearningPoints = lessonPlan.keyLearningPoints || [];
    const learningPointsList =
      keyLearningPoints.length > 0
        ? `\n\nKey learning points to focus on:\n${keyLearningPoints.map((item, i) => `${i + 1}. ${item}`).join("\n")}`
        : "";

    return `The purpose of the exit quiz is to assess the learning outcomes of the students, identify misconceptions, and consolidate the learning. Please consider alignment with the "key learning points" and "learning outcome" sections of the lesson plan.${learningPointsList}`;
  }
  throw new Error(`Unsupported quiz type: ${quizType as string}`);
}

/**
 * Multi-term ML Quiz Generator with improved search strategy:
 * - Generates one search term per prior knowledge/key learning point
 * - Runs independent searches in parallel (not concatenated)
 * - Applies adaptive Cohere limits based on number of queries
 * - Aims for ~20 total candidates distributed across queries
 */
export class MLQuizGeneratorMultiTerm extends MLQuizGenerator {
  /**
   * Generates semantic search queries from lesson plan content using OpenAI
   * V2: Generates more queries (3-6) focused on specific learning points
   */
  public async generateSemanticSearchQueries(
    lessonPlan: PartialLessonPlan,
    quizType: QuizPath,
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

You should generate queries for a ${quizType} quiz. ${quizSpecificInstruction(quizType, lessonPlan)}

Generate a list of 3-6 semantic search queries`;

    try {
      const response = await this.openai.beta.chat.completions.parse({
        model: "gpt-4.1",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_completion_tokens: 1000,
        response_format: zodResponseFormat(
          SemanticSearchSchema,
          "SemanticSearchQueries",
        ),
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        log.warn(
          "OpenAI returned empty content for semantic search generation",
        );
        return { queries: [] };
      }

      // Parse the content through the schema to ensure type safety
      const parsedContent = SemanticSearchSchema.parse(JSON.parse(content));

      log.info(
        `V2: Generated ${parsedContent.queries.length} semantic search queries for lesson plan`,
      );
      return parsedContent;
    } catch (error) {
      log.error("Failed to generate semantic search queries:", error);
      throw new Error(
        "Failed to generate semantic search queries from lesson plan",
      );
    }
  }

  private async generatePoolForQuery(
    query: string,
    candidatesPerQuery: number,
  ): Promise<QuizQuestionPool> {
    log.info(`V2: Searching for: "${query}"`);

    const results = await this.searchService.searchWithHybrid(
      "oak-vector-2025-04-16",
      query,
      SEARCH_SIZE,
      0.5,
    );

    const questionUids = await this.rerankAndExtractQuestionUids(
      results.hits,
      query,
      candidatesPerQuery,
    );

    log.info(
      `V2: Found ${questionUids.length} candidates for query: "${query.substring(0, 50)}..."`,
    );

    const questions = await this.retrievalService.retrieveQuestionsByIds(
      questionUids,
    );

    return {
      questions,
      source: {
        type: "mlSemanticSearch",
        semanticQuery: query,
      },
    };
  }

  private async generateQuizCandidatePools(
    lessonPlan: PartialLessonPlan,
    quizType: QuizPath,
  ): Promise<QuizQuestionPool[]> {
    const semanticQueries: z.infer<typeof SemanticSearchSchema> =
      await this.generateSemanticSearchQueries(lessonPlan, quizType);

    if (semanticQueries.queries.length === 0) {
      log.warn("V2: No queries generated, returning empty results");
      return [];
    }

    log.info(
      `V2: Running ${semanticQueries.queries.length} independent searches in parallel for ${quizType}`,
    );

    log.info(`V2: Targeting ${POOL_SIZE} candidates per query`);

    const pools = await Promise.all(
      semanticQueries.queries.map((query) =>
        this.generatePoolForQuery(query, POOL_SIZE),
      ),
    );

    const totalQuestions = pools.reduce(
      (sum, pool) => sum + pool.questions.length,
      0,
    );
    log.info(
      `V2: Collected ${totalQuestions} total candidates across ${pools.length} pools`,
    );

    return pools;
  }

  public override async generateMathsStarterQuizCandidates(
    lessonPlan: PartialLessonPlan,
  ): Promise<QuizQuestionPool[]> {
    return this.generateQuizCandidatePools(lessonPlan, "/starterQuiz");
  }

  public override async generateMathsExitQuizCandidates(
    lessonPlan: PartialLessonPlan,
  ): Promise<QuizQuestionPool[]> {
    return this.generateQuizCandidatePools(lessonPlan, "/exitQuiz");
  }
}
