import { aiLogger } from "@oakai/logger";

import type { PartialLessonPlan, QuizPath } from "../../../protocol/schema";
import type { Task } from "../instrumentation";
import type {
  QuestionSource,
  QuizQuestionPool,
  RagQuizQuestion,
} from "../interfaces";
import { CohereReranker } from "../services/CohereReranker";
import { ElasticsearchQuizSearchService } from "../services/ElasticsearchQuizSearchService";
import { QuizQuestionRetrievalService } from "../services/QuizQuestionRetrievalService";
import { SemanticQueryGenerator } from "../services/SemanticQueryGenerator";

const log = aiLogger("aila:quiz");

// Number of results to retrieve from Elasticsearch before reranking
const SEARCH_SIZE = 50;

// Number of candidates to keep per pool after Cohere reranking
const POOL_SIZE = 3;

/**
 * Semantic search source that generates multiple queries from the lesson plan.
 * - Generates search queries based on prior knowledge or key learning points
 * - Runs independent searches in parallel
 * - Uses Cohere reranking for relevance
 * - Returns separate pools maintaining semantic grouping
 */
export class MultiQuerySemanticSource implements QuestionSource {
  readonly name = "multiQuerySemantic";

  protected queryGenerator: SemanticQueryGenerator;
  protected searchService: ElasticsearchQuizSearchService;
  protected rerankService: CohereReranker;
  protected retrievalService: QuizQuestionRetrievalService;

  constructor(retrievalService?: QuizQuestionRetrievalService) {
    this.queryGenerator = new SemanticQueryGenerator();
    this.searchService = new ElasticsearchQuizSearchService();
    this.rerankService = new CohereReranker();
    this.retrievalService =
      retrievalService ?? new QuizQuestionRetrievalService();
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
    task: Task,
  ): Promise<RagQuizQuestion[]> {
    log.info(`MultiQuerySemanticSource: Searching for: "${query}"`);

    const results = await task.child("elasticsearch", async (t) => {
      const hits = await this.searchService.searchWithHybrid(
        "oak-vector-2025-04-16",
        query,
        t,
        SEARCH_SIZE,
        0.5,
      );
      return hits;
    });

    const simplifiedResults = this.searchService.transformHits(results.hits);

    const rerankedResults = await task.child("cohere", async (t) => {
      return this.rerankService.rerankDocuments(
        query,
        simplifiedResults,
        t,
        topN,
      );
    });

    const questionUids = rerankedResults.map((result) => result.questionUid);

    log.info(
      `MultiQuerySemanticSource: Found ${questionUids.length} candidates for query: "${query.substring(0, 50)}..."`,
    );

    const questions =
      await this.retrievalService.retrieveQuestionsByIds(questionUids);

    task.addData({ finalCandidates: questions });

    return questions;
  }

  private async retrieveQuestionsForAllQueries(
    lessonPlan: PartialLessonPlan,
    quizType: QuizPath,
    task: Task,
  ): Promise<QuizQuestionPool[]> {
    const semanticQueries = await task.child("queryGeneration", async (t) => {
      const result = await this.generateSemanticSearchQueries(
        lessonPlan,
        quizType,
      );
      t.addData({ queries: result.queries });
      return result;
    });

    if (semanticQueries.queries.length === 0) {
      log.warn(
        "MultiQuerySemanticSource: No queries generated, returning empty results",
      );
      return [];
    }

    log.info(
      `MultiQuerySemanticSource: Running ${semanticQueries.queries.length} independent searches in parallel for ${quizType}`,
    );
    log.info(
      `MultiQuerySemanticSource: Targeting ${POOL_SIZE} candidates per query`,
    );

    const pools = await Promise.all(
      semanticQueries.queries.map(async (query, index) => {
        return task.child(`query-${index}`, async (t) => {
          t.addData({ query });
          const questions = await this.searchAndRetrieveForQuery(
            query,
            POOL_SIZE,
            t,
          );
          return {
            questions,
            source: {
              type: "semanticSearch" as const,
              semanticQuery: query,
            },
          } satisfies QuizQuestionPool;
        });
      }),
    );

    const totalQuestions = pools.reduce(
      (sum, pool) => sum + pool.questions.length,
      0,
    );

    log.info(
      `MultiQuerySemanticSource: Collected ${totalQuestions} total candidates across ${pools.length} pools`,
    );

    return pools;
  }

  public async getStarterQuizCandidates(
    lessonPlan: PartialLessonPlan,
    _similarLessons: [],
    task: Task,
  ): Promise<QuizQuestionPool[]> {
    const pools = await this.retrieveQuestionsForAllQueries(
      lessonPlan,
      "/starterQuiz",
      task,
    );

    log.info(
      `MultiQuerySemanticSource: Generated ${pools.length} starter quiz pools`,
    );

    return pools;
  }

  public async getExitQuizCandidates(
    lessonPlan: PartialLessonPlan,
    _similarLessons: [],
    task: Task,
  ): Promise<QuizQuestionPool[]> {
    const pools = await this.retrieveQuestionsForAllQueries(
      lessonPlan,
      "/exitQuiz",
      task,
    );

    log.info(
      `MultiQuerySemanticSource: Generated ${pools.length} exit quiz pools`,
    );

    return pools;
  }
}
