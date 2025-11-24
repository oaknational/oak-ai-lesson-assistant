// ML-based Quiz Generator
import { aiLogger } from "@oakai/logger";

import type { SearchHit } from "@elastic/elasticsearch/lib/api/types";

import type { PartialLessonPlan, QuizPath } from "../../../protocol/schema";
import type {
  CustomSource,
  QuizQuestionPool,
  RagQuizQuestion,
} from "../interfaces";
import { CohereReranker } from "../services/CohereReranker";
import { ElasticsearchQuizSearchService } from "../services/ElasticsearchQuizSearchService";
import { QuizQuestionRetrievalService } from "../services/QuizQuestionRetrievalService";
import { SemanticQueryGenerator } from "../services/SemanticQueryGenerator";
import { BaseQuizGenerator } from "./BaseQuizGenerator";

const log = aiLogger("aila:quiz");

export class MLQuizGenerator extends BaseQuizGenerator {
  protected searchService: ElasticsearchQuizSearchService;
  protected retrievalService: QuizQuestionRetrievalService;
  protected rerankService: CohereReranker;
  protected queryGenerator: SemanticQueryGenerator;

  constructor() {
    super();

    this.searchService = new ElasticsearchQuizSearchService();
    this.retrievalService = new QuizQuestionRetrievalService();
    this.rerankService = new CohereReranker();
    this.queryGenerator = new SemanticQueryGenerator();
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
    quizQuestions: RagQuizQuestion[],
    quizType: QuizPath,
  ): RagQuizQuestion[][] {
    const quizQuestions2DArray: RagQuizQuestion[][] = [];
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
  ): Promise<RagQuizQuestion[]> {
    // Using hybrid search combining BM25 and vector similarity
    const semanticQueries = await this.generateSemanticSearchQueries(
      lessonPlan,
      quizType,
    );

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
  ) {
    return this.queryGenerator.generateSemanticSearchQueries(
      lessonPlan,
      quizType,
    );
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
