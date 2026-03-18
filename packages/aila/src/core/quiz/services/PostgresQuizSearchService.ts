import { prisma } from "@oakai/db";
import { aiLogger } from "@oakai/logger";

import OpenAI from "openai";

import type { SimplifiedResult } from "../interfaces";
import type { Task } from "../reporting";

const log = aiLogger("aila:quiz");

export interface SearchRow {
  question_uid: string;
  description: string;
  lesson_slug: string;
  quiz_type: string;
  score: number;
}

/**
 * Service for searching quiz questions using pgvector cosine similarity.
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
   * Performs vector similarity search using pgvector cosine distance.
   * Uses the IVFFlat index on the embedding column for fast approximate search.
   */
  public async search(
    query: string,
    task: Task,
    size: number = 50,
  ): Promise<SearchRow[]> {
    try {
      log.info(`Performing vector search, query: ${query}`);

      const queryEmbedding = await this.createEmbedding(query);
      const queryVectorString = `[${queryEmbedding.join(",")}]`;

      const rows = await prisma.$queryRaw<SearchRow[]>`
        SELECT
          question_uid,
          description,
          lesson_slug,
          quiz_type,
          (1 - (embedding <=> ${queryVectorString}::vector)) AS score
        FROM rag.quiz_questions
        WHERE embedding IS NOT NULL AND description IS NOT NULL
        ORDER BY embedding <=> ${queryVectorString}::vector
        LIMIT ${size}
      `;

      log.info(`Vector search found ${rows.length} hits`);

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
      log.error("Error performing vector search:", error);
      throw error;
    }
  }

  /**
   * Transforms Postgres rows into simplified results for reranking
   */
  public transformHits(rows: SearchRow[]): SimplifiedResult[] {
    return rows
      .filter((row) => row.description && row.question_uid)
      .map((row) => ({
        text: row.description,
        questionUid: row.question_uid,
      }));
  }
}
