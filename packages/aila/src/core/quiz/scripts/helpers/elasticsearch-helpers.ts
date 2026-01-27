import { aiLogger } from "@oakai/logger";

import { Client } from "@elastic/elasticsearch";

import type { CustomSource } from "../../interfaces";

const log = aiLogger("aila:quiz");

/**
 * Helper functions for directly querying Elasticsearch
 * Used for debugging and inspection scripts
 */

export function createElasticsearchClient(): Client {
  if (
    !process.env.I_DOT_AI_ELASTIC_CLOUD_ID ||
    !process.env.I_DOT_AI_ELASTIC_KEY
  ) {
    throw new Error(
      "Environment variables for Elastic Cloud ID and API Key must be set",
    );
  }

  return new Client({
    cloud: {
      id: process.env.I_DOT_AI_ELASTIC_CLOUD_ID,
    },
    auth: {
      apiKey: process.env.I_DOT_AI_ELASTIC_KEY,
    },
  });
}

/**
 * Find all question UIDs for given lesson slugs
 * Searches directly in Elasticsearch (not using lookup table)
 */
export async function lessonSlugToQuestionIds(
  client: Client,
  lessonSlugs: string[],
): Promise<string[]> {
  try {
    const response = await client.search<CustomSource>({
      index: "oak-vector-2025-04-16",
      body: {
        query: {
          bool: {
            must: [
              { exists: { field: "lessonSlug" } },
              { exists: { field: "questionUid" } },
              {
                terms: {
                  "lessonSlug.keyword": lessonSlugs,
                },
              },
            ],
          },
        },
      },
    });

    return response.hits.hits
      .map((hit) => hit._source?.questionUid)
      .filter((id): id is string => id !== undefined);
  } catch (error) {
    log.error("Error searching for questions:", error);
    return [];
  }
}

/**
 * Get all questions for a lesson slug, with full metadata
 */
export async function getQuestionsForLesson(
  client: Client,
  lessonSlug: string,
): Promise<CustomSource[]> {
  try {
    const response = await client.search<CustomSource>({
      index: "oak-vector-2025-04-16",
      body: {
        query: {
          bool: {
            must: [
              { exists: { field: "lessonSlug" } },
              { exists: { field: "questionUid" } },
              {
                term: {
                  "lessonSlug.keyword": lessonSlug,
                },
              },
            ],
          },
        },
        size: 100,
      },
    });

    return response.hits.hits
      .map((hit) => hit._source)
      .filter((source): source is CustomSource => source !== undefined);
  } catch (error) {
    log.error("Error fetching questions for lesson:", error);
    return [];
  }
}

/**
 * Get question by UID from text-only index (has full raw JSON)
 */
export async function getQuestionByUid(
  client: Client,
  questionUid: string,
): Promise<CustomSource | null> {
  try {
    const response = await client.search<CustomSource>({
      index: "quiz-questions-text-only-2025-04-16",
      body: {
        query: {
          term: {
            "metadata.questionUid.keyword": questionUid,
          },
        },
      },
    });

    const hit = response.hits.hits[0];
    return hit?._source ?? null;
  } catch (error) {
    log.error("Error fetching question by UID:", error);
    return null;
  }
}
