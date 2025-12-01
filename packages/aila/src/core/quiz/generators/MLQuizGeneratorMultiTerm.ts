// ML-based Quiz Generator - Multi-Term approach
// Independent semantic search per learning goal
import { aiLogger } from "@oakai/logger";

import type { PartialLessonPlan, QuizPath } from "../../../protocol/schema";
import type { QuizQuestionPool, RagQuizQuestion } from "../interfaces";
import { CohereReranker } from "../services/CohereReranker";
import { ElasticsearchQuizSearchService } from "../services/ElasticsearchQuizSearchService";
import { SemanticQueryGenerator } from "../services/SemanticQueryGenerator";
import type { Span } from "../tracing";
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
   * @param span - Optional tracing span for this query
   */
  private async searchAndRetrieveForQuery(
    query: string,
    topN: number,
    span?: Span,
  ): Promise<RagQuizQuestion[]> {
    log.info(`MLQuizGeneratorMultiTerm: Searching for: "${query}"`);

    span?.setData("query", query);

    const esSpan = span?.startChild("elasticsearch");
    const results = await this.searchService.searchWithHybrid(
      "oak-vector-2025-04-16",
      query,
      SEARCH_SIZE,
      0.5,
      esSpan,
    );
    esSpan?.end();

    const simplifiedResults = this.searchService.transformHits(results.hits);

    const cohereSpan = span?.startChild("cohere");
    const rerankedResults = await this.rerankService.rerankDocuments(
      query,
      simplifiedResults,
      topN,
      cohereSpan,
    );
    cohereSpan?.end();

    const questionUids = rerankedResults.map((result) => result.questionUid);

    log.info(
      `MLQuizGeneratorMultiTerm: Found ${questionUids.length} candidates for query: "${query.substring(0, 50)}..."`,
    );

    const questions =
      await this.retrievalService.retrieveQuestionsByIds(questionUids);

    span?.setData(
      "finalCandidates",
      questions.map((q) => q.sourceUid),
    );

    return questions;
  }

  private async retrieveQuestionsForAllQueries(
    lessonPlan: PartialLessonPlan,
    quizType: QuizPath,
    span?: Span,
  ): Promise<QuizQuestionPool[]> {
    const queryGenSpan = span?.startChild("query-generation");
    const semanticQueries = await this.generateSemanticSearchQueries(
      lessonPlan,
      quizType,
    );
    queryGenSpan?.setData("queries", semanticQueries.queries);
    queryGenSpan?.end();

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
      semanticQueries.queries.map(async (query, index) => {
        const querySpan = span?.startChild(`query-${index}`);
        const questions = await this.searchAndRetrieveForQuery(
          query,
          POOL_SIZE,
          querySpan,
        );
        querySpan?.end();

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
    _relevantLessons?: unknown, // Not used by ML generator
    span?: Span,
  ): Promise<QuizQuestionPool[]> {
    const pools = await this.retrieveQuestionsForAllQueries(
      lessonPlan,
      "/starterQuiz",
      span,
    );

    log.info(
      `MLQuizGeneratorMultiTerm: Generated ${pools.length} starter quiz pools`,
    );

    return pools;
  }

  public async generateMathsExitQuizCandidates(
    lessonPlan: PartialLessonPlan,
    _relevantLessons?: unknown, // Not used by ML generator
    span?: Span,
  ): Promise<QuizQuestionPool[]> {
    const pools = await this.retrieveQuestionsForAllQueries(
      lessonPlan,
      "/exitQuiz",
      span,
    );

    log.info(
      `MLQuizGeneratorMultiTerm: Generated ${pools.length} exit quiz pools`,
    );

    return pools;
  }
}
