import { aiLogger } from "@oakai/logger";

import type { SearchHit } from "@elastic/elasticsearch/lib/api/types";
import { Client } from "@elastic/elasticsearch";
import invariant from "tiny-invariant";
import { z } from "zod";

import type { QuizV1Question } from "../../../protocol/schema";
import { QuizV1QuestionSchema } from "../../../protocol/schema";
import type { HasuraQuizQuestion } from "../../../protocol/schemas/quiz/rawQuiz";
import { hasuraQuizQuestionSchema } from "../../../protocol/schemas/quiz/rawQuiz";
import type {
  QuizQuestionTextOnlySource,
  QuizQuestionWithSourceData,
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
   * Retrieves quiz questions by their UIDs from Elasticsearch
   * Preserves the order of the input questionUids array
   */
  public async retrieveQuestionsByIds(
    questionUids: string[],
  ): Promise<QuizQuestionWithSourceData[]> {
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

    const parsedQuestions: QuizQuestionWithSourceData[] = response.hits.hits
      .map((hit) => this.parseQuizQuestionWithSourceData(hit))
      .filter((item): item is QuizQuestionWithSourceData => item !== null);

    // Sort to match input order - Elasticsearch terms query doesn't preserve order
    const orderedQuestions = questionUids
      .map((uid) => parsedQuestions.find((q) => q.sourceUid === uid))
      .filter((q): q is QuizQuestionWithSourceData => Boolean(q));

    return orderedQuestions;
  }

  private parseQuizQuestionWithSourceData(
    hit: SearchHit<QuizQuestionTextOnlySource>,
  ): QuizQuestionWithSourceData | null {
    if (!hit._source) {
      log.error("Hit source is undefined");
      return null;
    }

    const jsonString = hit._source.text;
    const rawQuizString = hit._source.metadata.raw_json;

    if (!rawQuizString) {
      return null;
    }

    try {
      // Parse QuizV1 format from text field
      const questionData = JSON.parse(jsonString);
      const quizQuestion = QuizV1QuestionSchema.parse(questionData);

      // Parse HasuraQuizQuestion format from raw_json field
      const sourceData = JSON.parse(rawQuizString);
      const source = hasuraQuizQuestionSchema.parse(sourceData);

      return {
        ...quizQuestion,
        sourceUid: source.questionUid,
        source,
      };
    } catch (error) {
      // TODO: Should we throw here instead of returning null?
      // Current behavior silently filters out invalid questions
      if (error instanceof z.ZodError) {
        log.error("Source validation error:", error.errors);
      } else if (error instanceof SyntaxError) {
        log.error("JSON parsing error:", error.message);
      } else {
        log.error("An unexpected error occurred:", error);
      }
      return null;
    }
  }
}
