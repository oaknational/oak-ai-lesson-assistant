// ML-based Quiz Generator
import { aiLogger } from "@oakai/logger";

import type { SearchHit } from "@elastic/elasticsearch/lib/api/types";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

import type { PartialLessonPlan, QuizPath } from "../../../protocol/schema";
import type {
  CustomSource,
  QuizQuestionPool,
  QuizQuestionWithSourceData,
} from "../interfaces";
import { CohereReranker } from "../services/CohereReranker";
import { ElasticsearchQuizSearchService } from "../services/ElasticsearchQuizSearchService";
import { QuizQuestionRetrievalService } from "../services/QuizQuestionRetrievalService";
import { unpackLessonPlanForPrompt } from "../unpackLessonPlan";
import { BaseQuizGenerator } from "./BaseQuizGenerator";

const log = aiLogger("aila:quiz");

const SemanticSearchSchema = z.object({
  queries: z.array(z.string()).describe("A list of semantic search queries"),
});

function quizSpecificInstruction(quizType: QuizPath) {
  if (quizType === "/starterQuiz") {
    return `The purpose of the starter quiz is to assess the prior knowledge of the students, identify misconceptions, and reactivate prior knowledge. Please consider alignment with the "prior knowledge" section of the lesson plan.`;
  } else if (quizType === "/exitQuiz") {
    return `The purpose of the exit quiz is to assess the learning outcomes of the students, identify misconceptions, and consolidate the learning. Please consider alignment with the "key learning points" and "learning outcome" sections of the lesson plan.`;
  }
  throw new Error(`Unsupported quiz type: ${quizType as string}`);
}

export class MLQuizGenerator extends BaseQuizGenerator {
  protected searchService: ElasticsearchQuizSearchService;
  protected retrievalService: QuizQuestionRetrievalService;
  protected rerankService: CohereReranker;
  public openai: OpenAI;

  constructor() {
    super();

    this.searchService = new ElasticsearchQuizSearchService();
    this.retrievalService = new QuizQuestionRetrievalService();
    this.rerankService = new CohereReranker();

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Validates the lesson plan
   * @throws {Error} If the lesson plan is invalid
   */
  private isValidLessonPlan(lessonPlan: PartialLessonPlan | null): void {
    if (!lessonPlan) throw new Error("Lesson plan is null");
    // Check for minimum required properties
    if (
      !(
        ("title" in lessonPlan && "keyStage" in lessonPlan)
        // "topic" in lessonPlan
      )
    ) {
      throw new Error("Invalid lesson plan: missing required properties");
    }
  }

  // Our Rag system may retrieve N Questions. We split them into chunks of 6 to conform with the schema. If we have less than 6 questions we pad with questions from the appropriate section of the lesson plan.
  // If there are no questions for padding, we pad with empty questions.
  private splitQuestionsIntoSixAndPad(
    lessonPlan: PartialLessonPlan,
    quizQuestions: QuizQuestionWithSourceData[],
    quizType: QuizPath,
  ): QuizQuestionWithSourceData[][] {
    const quizQuestions2DArray: QuizQuestionWithSourceData[][] = [];
    log.info(
      `MLQuizGenerator: Splitting ${quizQuestions.length} questions into chunks of 6`,
    );
    const chunkSize = 6;

    for (let i = 0; i < quizQuestions.length; i += chunkSize) {
      const chunk = quizQuestions.slice(i, i + chunkSize);
      quizQuestions2DArray.push(chunk);
    }

    return quizQuestions2DArray;
  }

  public async generateMathsQuizML(
    lessonPlan: PartialLessonPlan,
    quizType: QuizPath,
  ): Promise<QuizQuestionWithSourceData[]> {
    // Using hybrid search combining BM25 and vector similarity
    const semanticQueries: z.infer<typeof SemanticSearchSchema> =
      await this.generateSemanticSearchQueries(lessonPlan, quizType);

    const concatenatedQueries: string = semanticQueries.queries.join(" ");

    const results = await this.searchService.searchWithHybrid(
      "oak-vector-2025-04-16",
      concatenatedQueries,
      100,
      0.5, // 50/50 weight between BM25 and vector search
    );

    const questionUids = await this.rerankAndExtractQuestionUids(
      results.hits,
      concatenatedQueries,
      10,
    );
    const quizQuestions =
      await this.retrievalService.retrieveQuestionsByIds(questionUids);
    return quizQuestions;
  }

  /**
   * Generates semantic search queries from lesson plan content using OpenAI
   */
  public async generateSemanticSearchQueries(
    lessonPlan: PartialLessonPlan,
    quizType: QuizPath,
  ): Promise<z.infer<typeof SemanticSearchSchema>> {
    const unpackedContent = unpackLessonPlanForPrompt(lessonPlan);

    const prompt = `Based on the following lesson plan content, generate a series of semantic search queries that could be used to find relevant quiz questions from a question bank for questions from the UK mathematics curriculum.

The search queries should:
- Focus on key concepts, topics, and learning outcomes
- Use educational terminology appropriate for the subject and key stage
- Be specific enough to find relevant questions but broad enough to capture variations
- Include different question types (knowledge, understanding, application)
- Consider prerequisite knowledge and common misconceptions

Lesson plan content:
${unpackedContent}

You should generate queries for a ${quizType} quiz. ${quizSpecificInstruction(quizType)}

Generate a list of 1-3 semantic search queries`;

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

      const parsedContent = response.choices[0]?.message?.parsed;
      if (!parsedContent) {
        log.warn(
          "OpenAI returned empty parsed content for semantic search generation",
        );
        return { queries: [] };
      }

      log.info(
        `Generated ${parsedContent.queries.length} semantic search queries for lesson plan`,
      );
      return parsedContent;
    } catch (error) {
      log.error("Failed to generate semantic search queries:", error);
      throw new Error(
        "Failed to generate semantic search queries from lesson plan",
      );
    }
  }

  public async generateMathsStarterQuizCandidates(
    lessonPlan: PartialLessonPlan,
  ): Promise<QuizQuestionPool[]> {
    const questions = await this.generateMathsQuizML(
      lessonPlan,
      "/starterQuiz",
    );
    return [
      {
        questions,
        source: {
          type: "mlSemanticSearch",
          semanticQuery: "Generated from prior knowledge",
        },
      } satisfies QuizQuestionPool,
    ];
  }

  public async generateMathsExitQuizCandidates(
    lessonPlan: PartialLessonPlan,
  ): Promise<QuizQuestionPool[]> {
    const questions = await this.generateMathsQuizML(lessonPlan, "/exitQuiz");
    return [
      {
        questions,
        source: {
          type: "mlSemanticSearch",
          semanticQuery: "Generated from key learning points",
        },
      } satisfies QuizQuestionPool,
    ];
  }

  // === ML-specific search and processing methods ===

  protected async rerankAndExtractQuestionUids(
    hits: SearchHit<CustomSource>[],
    query: string,
    topN: number,
  ): Promise<string[]> {
    const simplifiedResults = this.searchService.transformHits(hits);
    const rerankedResults = await this.rerankService.rerankDocuments(
      query,
      simplifiedResults,
      topN,
    );
    return rerankedResults.map((result) => result.document.questionUid);
  }
}
