import { aiLogger } from "@oakai/logger";

import type { PartialLessonPlan, QuizPath } from "../../../protocol/schema";
import type { QuizQuestionPool, RagQuizQuestion } from "../interfaces";
import { CohereReranker } from "../services/CohereReranker";
import { ElasticsearchQuizSearchService } from "../services/ElasticsearchQuizSearchService";
import { QuizQuestionRetrievalService } from "../services/QuizQuestionRetrievalService";
import { SemanticQueryGenerator } from "../services/SemanticQueryGenerator";
import type { MLMultiTermDebugResult, MLSearchTermDebugResult } from "./types";

const log = aiLogger("aila:quiz");

// Number of results to retrieve from Elasticsearch before reranking
const SEARCH_SIZE = 50;

// Number of candidates to keep per pool after Cohere reranking
const POOL_SIZE = 3;

/**
 * Debug version of MLQuizGeneratorMultiTerm that captures intermediate results
 * at each stage of the pipeline for visualization in the debug UI.
 */
export class MLQuizGeneratorMultiTermDebug {
  private queryGenerator: SemanticQueryGenerator;
  private searchService: ElasticsearchQuizSearchService;
  private rerankService: CohereReranker;
  private retrievalService: QuizQuestionRetrievalService;
  private debugResults: MLSearchTermDebugResult[] = [];

  constructor() {
    this.queryGenerator = new SemanticQueryGenerator();
    this.searchService = new ElasticsearchQuizSearchService();
    this.rerankService = new CohereReranker();
    this.retrievalService = new QuizQuestionRetrievalService();
  }

  /**
   * Returns the debug results captured during the last generation
   */
  public getDebugResults(): MLSearchTermDebugResult[] {
    return this.debugResults;
  }

  /**
   * Searches and retrieves questions for a single query with debug info
   */
  private async searchAndRetrieveForQueryWithDebug(
    query: string,
    topN: number,
  ): Promise<{
    questions: RagQuizQuestion[];
    debug: MLSearchTermDebugResult;
  }> {
    const start = Date.now();

    log.info(`MLQuizGeneratorMultiTermDebug: Searching for: "${query}"`);

    // Get ES results with debug scores
    const { hitsWithScores, simplifiedResults } =
      await this.searchService.searchWithHybridDebug(
        "oak-vector-2025-04-16",
        query,
        SEARCH_SIZE,
        0.5,
      );

    // Get rerank results with debug info
    const { topResults, allResults } =
      await this.rerankService.rerankDocumentsWithDebug(
        query,
        simplifiedResults,
        topN,
      );

    // Retrieve full question objects
    const questionUids = topResults.map((result) => result.questionUid);
    const questions =
      await this.retrievalService.retrieveQuestionsByIds(questionUids);

    const debug: MLSearchTermDebugResult = {
      query,
      elasticsearchHits: hitsWithScores,
      cohereResults: allResults,
      finalCandidates: questions,
      timingMs: Date.now() - start,
    };

    log.info(
      `MLQuizGeneratorMultiTermDebug: Query "${query.substring(0, 30)}..." - ${hitsWithScores.length} ES hits, ${allResults.length} reranked, ${questions.length} final candidates`,
    );

    return { questions, debug };
  }

  /**
   * Retrieves questions for all queries with debug information
   */
  private async retrieveQuestionsForAllQueriesWithDebug(
    lessonPlan: PartialLessonPlan,
    quizType: QuizPath,
  ): Promise<QuizQuestionPool[]> {
    this.debugResults = []; // Reset debug results

    const semanticQueries =
      await this.queryGenerator.generateSemanticSearchQueries(
        lessonPlan,
        quizType,
        6, // Multi-term generates up to 6 queries
      );

    if (semanticQueries.queries.length === 0) {
      log.warn(
        "MLQuizGeneratorMultiTermDebug: No queries generated, returning empty results",
      );
      return [];
    }

    log.info(
      `MLQuizGeneratorMultiTermDebug: Running ${semanticQueries.queries.length} independent searches in parallel for ${quizType}`,
    );

    const pools = await Promise.all(
      semanticQueries.queries.map(async (query) => {
        const { questions, debug } =
          await this.searchAndRetrieveForQueryWithDebug(query, POOL_SIZE);
        this.debugResults.push(debug);
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
      `MLQuizGeneratorMultiTermDebug: Collected ${totalQuestions} total candidates across ${pools.length} pools`,
    );

    return pools;
  }

  /**
   * Generates starter quiz candidates with full debug information
   */
  public async generateWithDebug(
    lessonPlan: PartialLessonPlan,
    quizType: QuizPath,
  ): Promise<MLMultiTermDebugResult> {
    const start = Date.now();

    const pools = await this.retrieveQuestionsForAllQueriesWithDebug(
      lessonPlan,
      quizType,
    );

    return {
      generatorType: "ml-multi-term",
      pools,
      searchTerms: this.debugResults,
      timingMs: Date.now() - start,
    };
  }
}
