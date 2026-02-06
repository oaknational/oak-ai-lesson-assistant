import { aiLogger } from "@oakai/logger";

import { Client } from "@elastic/elasticsearch";
import type {
  SearchHit,
  SearchHitsMetadata,
} from "@elastic/elasticsearch/lib/api/types";
import OpenAI from "openai";

import type { CustomSource, SimplifiedResult } from "../interfaces";
import type { Task } from "../reporting";

const log = aiLogger("aila:quiz");

/**
 * Service for searching quiz questions using Elasticsearch hybrid search
 * Combines BM25 text search with vector similarity search
 */
export class ElasticsearchQuizSearchService {
  private readonly client: Client;
  private readonly openai: OpenAI;

  constructor() {
    if (
      !process.env.I_DOT_AI_ELASTIC_CLOUD_ID ||
      !process.env.I_DOT_AI_ELASTIC_KEY
    ) {
      throw new Error(
        "Environment variables for Elastic Cloud ID and API Key must be set",
      );
    }

    this.client = new Client({
      cloud: {
        id: process.env.I_DOT_AI_ELASTIC_CLOUD_ID,
      },
      auth: {
        apiKey: process.env.I_DOT_AI_ELASTIC_KEY,
      },
    });

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
   * Performs hybrid search combining BM25 and vector similarity
   * @param hybridWeight - Weight for vector search (0.0-1.0), BM25 gets (1 - hybridWeight)
   * @param task - Task for tracking debug data
   */
  public async searchWithHybrid(
    index: string,
    query: string,
    task: Task,
    size: number = 100,
    hybridWeight: number = 0.5,
  ): Promise<SearchHitsMetadata<CustomSource>> {
    try {
      log.info(`Performing hybrid search on index: ${index}, query: ${query}`);

      const queryEmbedding = await this.createEmbedding(query);

      const response = await this.client.search<CustomSource>({
        index,
        size,
        query: {
          bool: {
            must: [
              {
                function_score: {
                  query: {
                    bool: {
                      should: [
                        {
                          match: {
                            text: {
                              query,
                              boost: 1 - hybridWeight,
                            },
                          },
                        },
                        {
                          script_score: {
                            query: { match_all: {} },
                            script: {
                              source: `
                                if (doc['embedding'].size() == 0) {
                                  return 0;
                                }
                                return cosineSimilarity(params.query_vector, 'embedding') + 1.0;
                              `,
                              params: {
                                query_vector: queryEmbedding,
                              },
                            },
                            boost: hybridWeight,
                          },
                        },
                      ],
                    },
                  },
                  boost_mode: "sum",
                },
              },
            ],
            filter: [{ term: { isLegacy: false } }],
          },
        },
      });

      if (!response.hits) {
        throw new Error("No hits property in the search response");
      }

      log.info(`Hybrid search found ${response.hits.hits.length} hits`);

      // Record debug data
      task.addData({
        query,
        size,
        hitCount: response.hits.hits.length,
        hitsWithScores: response.hits.hits
          .map((hit) => {
            const source = hit._source;
            if (!source?.questionUid || !source.text) {
              return null;
            }
            return {
              questionUid: source.questionUid,
              text: source.text,
              score: hit._score ?? 0,
              lessonSlug: source.lessonSlug ?? "",
            };
          })
          .filter(Boolean),
      });

      return response.hits;
    } catch (error) {
      log.error("Error performing hybrid search:", error);
      if (error instanceof Error) {
        log.error("Error message:", error.message);
        log.error("Error stack:", error.stack);
      }
      throw error;
    }
  }

  /**
   * Transforms Elasticsearch hits into simplified results for reranking
   */
  public transformHits(hits: SearchHit<CustomSource>[]): SimplifiedResult[] {
    return hits
      .map((hit) => {
        const source = hit._source;

        if (!source) {
          log.warn("Hit source is undefined:", hit);
          return null;
        }

        if (
          typeof source.text !== "string" ||
          typeof source.questionUid !== "string"
        ) {
          log.warn("Hit is missing required fields:", hit);
          return null;
        }

        return {
          text: source.text,
          questionUid: source.questionUid,
        };
      })
      .filter((item): item is SimplifiedResult => item !== null);
  }
}
