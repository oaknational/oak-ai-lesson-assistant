import { prisma } from "@oakai/db";
import { aiLogger } from "@oakai/logger";

import OpenAI from "openai";

import type {
  ImageMetadata,
  QuizV3Question,
} from "../../../protocol/schemas/quiz/quizV3";
import type { SimplifiedResult } from "../interfaces";
import type { Task } from "../reporting";

const log = aiLogger("aila:quiz");

export interface HybridSearchRow {
  question_uid: string;
  description: string;
  lesson_slug: string;
  quiz_type: string;
  quiz_question: QuizV3Question;
  image_metadata: ImageMetadata[];
  score: number;
}

/**
 * Service for searching quiz questions using Postgres hybrid search.
 * Combines full-text search (ts_rank) with vector similarity (pgvector cosine).
 * Replaces ElasticsearchQuizSearchService.
 */
export class PostgresQuizSearchService {
  private readonly openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Creates a text embedding using OpenAI's embedding model
   */
  public async createEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: "text-embedding-3-large",
        input: text,
        encoding_format: "float",
        dimensions: 768,
      });

      return response.data[0]?.embedding ?? [];
    } catch (error) {
      log.error("Error creating embedding:", error);
      throw error;
    }
  }

  /**
   * Performs hybrid search combining full-text search and vector similarity.
   * @param hybridWeight - Weight for vector search (0.0-1.0), text gets (1 - hybridWeight)
   * @param task - Task for tracking debug data
   */
  public async searchWithHybrid(
    query: string,
    task: Task,
    size: number = 100,
    hybridWeight: number = 0.5,
  ): Promise<HybridSearchRow[]> {
    try {
      log.info(`Performing hybrid search, query: ${query}`);

      const queryEmbedding = await this.createEmbedding(query);
      const queryVectorString = `[${queryEmbedding.join(",")}]`;

      const rows = await prisma.$queryRaw<HybridSearchRow[]>`
        SELECT
          question_uid,
          description,
          lesson_slug,
          quiz_type,
          quiz_question,
          image_metadata,
          (${1 - hybridWeight} * ts_rank(to_tsvector('english', description), plainto_tsquery('english', ${query}))
            + ${hybridWeight} * (1 - (embedding <=> ${queryVectorString}::vector))) AS score
        FROM rag.quiz_questions
        WHERE description IS NOT NULL AND embedding IS NOT NULL
        ORDER BY score DESC
        LIMIT ${size}
      `;

      log.info(`Hybrid search found ${rows.length} hits`);

      task.addData({
        query,
        size,
        hitCount: rows.length,
        hitsWithScores: rows.map((row) => ({
          questionUid: row.question_uid,
          text: row.description,
          score: row.score,
          lessonSlug: row.lesson_slug,
        })),
      });

      return rows;
    } catch (error) {
      log.error("Error performing hybrid search:", error);
      throw error;
    }
  }

  /**
   * Transforms Postgres rows into simplified results for reranking
   */
  public transformHits(rows: HybridSearchRow[]): SimplifiedResult[] {
    return rows
      .filter((row) => row.description && row.question_uid)
      .map((row) => ({
        text: row.description,
        questionUid: row.question_uid,
      }));
  }
}
