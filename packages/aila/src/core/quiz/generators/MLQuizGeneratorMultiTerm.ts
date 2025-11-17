// ML-based Quiz Generator - Multi-Term approach
// Independent semantic search per learning goal
import { aiLogger } from "@oakai/logger";

import type { PartialLessonPlan, QuizPath } from "../../../protocol/schema";
import type {
  QuizQuestionPool,
  QuizQuestionWithSourceData,
} from "../interfaces";
import { CohereReranker } from "../services/CohereReranker";
import { ElasticsearchQuizSearchService } from "../services/ElasticsearchQuizSearchService";
import { QuizQuestionRetrievalService } from "../services/QuizQuestionRetrievalService";
import { SemanticQueryGenerator } from "../services/SemanticQueryGenerator";
import { BaseQuizGenerator } from "./BaseQuizGenerator";

const log = aiLogger("aila:quiz");

// Number of results to retrieve from Elasticsearch before reranking
const SEARCH_SIZE = 50;

// Number of candidates to keep per pool after Cohere reranking
const POOL_SIZE = 3;

/**
 * Multi-term ML Quiz Generator with improved search strategy:
 * - Generates one search term per prior knowledge/key learning point
 * - Runs independent searches in parallel (not concatenated)
 * - Uses Cohere's topN parameter for efficient reranking
 * - Returns separate pools maintaining semantic grouping
 */
export class MLQuizGeneratorMultiTerm extends BaseQuizGenerator {
  protected queryGenerator: SemanticQueryGenerator;
  protected searchService: ElasticsearchQuizSearchService;
  protected rerankService: CohereReranker;

  constructor() {
    super();
    this.queryGenerator = new SemanticQueryGenerator();
    this.searchService = new ElasticsearchQuizSearchService();
    this.rerankService = new CohereReranker();
  }

  /**
   * Generates semantic search queries from lesson plan content using OpenAI
   * Generates 3-6 queries focused on specific learning points
   */
  public async generateSemanticSearchQueries(
    lessonPlan: PartialLessonPlan,
    quizType: QuizPath,
  ) {
    return this.queryGenerator.generateSemanticSearchQueries(
      lessonPlan,
      quizType,
      6, // Multi-term generates up to 6 queries
    );
  }

  /**
   * Searches and retrieves questions for a single query
   */
  private async searchAndRetrieveForQuery(
    query: string,
    topN: number,
  ): Promise<QuizQuestionWithSourceData[]> {
    log.info(`MLQuizGeneratorMultiTerm: Searching for: "${query}"`);

    const results = await this.searchService.searchWithHybrid(
      "oak-vector-2025-04-16",
      query,
      SEARCH_SIZE,
      0.5,
    );

    const simplifiedResults = this.searchService.transformHits(results.hits);
    const rerankedResults = await this.rerankService.rerankDocuments(
      query,
      simplifiedResults,
      topN,
    );

    // TODO: Verify this extraction is correct - CohereReranker now returns typed results
    // with questionUid on the document object. Previously used extractCustomId which parsed JSON.
    const questionUids = rerankedResults.map(
      (result) => result.document.questionUid,
    );

    log.info(
      `MLQuizGeneratorMultiTerm: Found ${questionUids.length} candidates for query: "${query.substring(0, 50)}..."`,
    );

    const questions =
      await this.retrievalService.retrieveQuestionsByIds(questionUids);

    return questions;
  }

  private async retrieveQuestionsForAllQueries(
    lessonPlan: PartialLessonPlan,
    quizType: QuizPath,
  ): Promise<QuizQuestionPool[]> {
    const semanticQueries = await this.generateSemanticSearchQueries(
      lessonPlan,
      quizType,
    );

    if (semanticQueries.queries.length === 0) {
      log.warn(
        "MLQuizGeneratorMultiTerm: No queries generated, returning empty results",
      );
      return [];
    }

    log.info(
      `MLQuizGeneratorMultiTerm: Running ${semanticQueries.queries.length} independent searches in parallel for ${quizType}`,
    );
    log.info(
      `MLQuizGeneratorMultiTerm: Targeting ${POOL_SIZE} candidates per query`,
    );

    const pools = await Promise.all(
      semanticQueries.queries.map(async (query) => {
        const questions = await this.searchAndRetrieveForQuery(
          query,
          POOL_SIZE,
        );
        return {
          questions,
          source: {
            type: "mlSemanticSearch" as const,
            semanticQuery: query,
          },
        } satisfies QuizQuestionPool;
      }),
    );

    const totalQuestions = pools.reduce(
      (sum, pool) => sum + pool.questions.length,
      0,
    );

    log.info(
      `MLQuizGeneratorMultiTerm: Collected ${totalQuestions} total candidates across ${pools.length} pools`,
    );

    return pools;
  }

  public async generateMathsStarterQuizCandidates(
    lessonPlan: PartialLessonPlan,
  ): Promise<QuizQuestionPool[]> {
    const pools = await this.retrieveQuestionsForAllQueries(
      lessonPlan,
      "/starterQuiz",
    );

    log.info(
      `MLQuizGeneratorMultiTerm: Generated ${pools.length} starter quiz pools`,
    );

    return pools;
  }

  public async generateMathsExitQuizCandidates(
    lessonPlan: PartialLessonPlan,
  ): Promise<QuizQuestionPool[]> {
    const pools = await this.retrieveQuestionsForAllQueries(
      lessonPlan,
      "/exitQuiz",
    );

    log.info(
      `MLQuizGeneratorMultiTerm: Generated ${pools.length} exit quiz pools`,
    );

    return pools;
  }
}
