import { aiLogger } from "@oakai/logger";

import { Client } from "@elastic/elasticsearch";
import type { SearchHit } from "@elastic/elasticsearch/lib/api/types";
import invariant from "tiny-invariant";
import { z } from "zod";

import { convertHasuraQuizToV3 } from "../../../protocol/schemas/quiz/conversion/rawQuizIngest";
import type { HasuraQuizQuestion } from "../../../protocol/schemas/quiz/rawQuiz";
import { hasuraQuizQuestionSchema } from "../../../protocol/schemas/quiz/rawQuiz";
import type {
  QuizQuestionTextOnlySource,
  RagQuizQuestion,
} from "../interfaces";

const log = aiLogger("aila:quiz");

/**
 * Service for retrieving and parsing quiz questions from Elasticsearch
 */
export class QuizQuestionRetrievalService {
  private readonly client: Client;

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
  }

  /**
   * Retrieves quiz questions by their UIDs from Elasticsearch.
   * Converts to V3 format immediately (supporting all question types).
   * Preserves the order of the input questionUids array.
   *
   * Note: Currently the ES index stores V1 (multiple-choice only) in the text field,
   * so we parse from raw_json instead. Future improvement: index V3 format directly.
   */
  public async retrieveQuestionsByIds(
    questionUids: string[],
  ): Promise<RagQuizQuestion[]> {
    const response = await this.client.search<QuizQuestionTextOnlySource>({
      index: "quiz-questions-text-only-2025-04-16",
      body: {
        query: {
          bool: {
            must: [
              {
                terms: {
                  "metadata.questionUid.keyword": questionUids,
                },
              },
            ],
          },
        },
      },
    });

    if (!response.hits.hits[0]?._source) {
      log.error("No questions found for questionUids: ", questionUids);
      return [];
    }

    const parsedQuestions: RagQuizQuestion[] = response.hits.hits
      .map((hit) => this.parseRagQuizQuestion(hit))
      .filter((item): item is RagQuizQuestion => item !== null);

    // Sort to match input order - Elasticsearch terms query doesn't preserve order
    const orderedQuestions = questionUids
      .map((uid) => parsedQuestions.find((q) => q.sourceUid === uid))
      .filter((q): q is RagQuizQuestion => Boolean(q));

    return orderedQuestions;
  }

  private parseRagQuizQuestion(
    hit: SearchHit<QuizQuestionTextOnlySource>,
  ): RagQuizQuestion | null {
    if (!hit._source) {
      log.error("Hit source is undefined");
      return null;
    }

    const rawQuizString = hit._source.metadata.raw_json;

    if (!rawQuizString) {
      return null;
    }

    try {
      // Parse HasuraQuizQuestion from raw_json field
      const sourceData = JSON.parse(rawQuizString);
      const source = hasuraQuizQuestionSchema.parse(sourceData);

      // Convert to V3 (supports all question types: multiple-choice, short-answer, match, order)
      const quizV3 = convertHasuraQuizToV3([source]);

      if (!quizV3.questions[0]) {
        log.error("No question returned from V3 conversion", {
          sourceUid: source.questionUid,
        });
        return null;
      }

      return {
        question: quizV3.questions[0],
        sourceUid: source.questionUid,
        source,
        imageMetadata: quizV3.imageMetadata,
      };
    } catch (error) {
      // TODO: Should we throw here instead of returning null?
      // Current behavior silently filters out invalid questions
      if (error instanceof z.ZodError) {
        log.error("Validation error:", {
          errors: error.errors,
          rawJsonPreview: rawQuizString.substring(0, 300),
        });
      } else if (error instanceof SyntaxError) {
        log.error("JSON parsing error:", error.message);
      } else {
        log.error("An unexpected error occurred:", error);
      }
      return null;
    }
  }
}
