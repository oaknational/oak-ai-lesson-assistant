import { Client } from "@elastic/elasticsearch";
import { posthogAiBetaServerClient } from "@oakai/core/src/analytics/posthogAiBetaServerClient";
import { aiLogger } from "@oakai/logger";
import { z } from "zod";

import type { QuizPath } from "../../protocol/schema";
import { QuizSetSchema } from "./interfaces";
import type { LessonSlugQuizLookup, QuizIDSource, QuizSet } from "./interfaces";

const log = aiLogger("aila:quiz");

// Feature flag for allowing non-legacy quizzes
const NON_LEGACY_QUIZZES_FLAG = "non-legacy-quizzes-v0";

export abstract class BaseLessonQuizLookup implements LessonSlugQuizLookup {
  abstract getStarterQuiz(
    lessonSlug: string,
    userId?: string,
  ): Promise<string[]>;
  abstract getExitQuiz(lessonSlug: string, userId?: string): Promise<string[]>;
  abstract hasStarterQuiz(
    lessonSlug: string,
    userId?: string,
  ): Promise<boolean>;
  abstract hasExitQuiz(lessonSlug: string, userId?: string): Promise<boolean>;
}

export class ElasticLessonQuizLookup extends BaseLessonQuizLookup {
  private readonly client: Client;

  constructor() {
    super();

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
  public async isLegacyLessonSlug(lessonSlug: string): Promise<boolean> {
    try {
      const response = await this.client.search<QuizIDSource>({
        index: "lesson-slug-lookup",
        query: {
          bool: {
            must: [{ term: { "metadata.lessonSlug.keyword": lessonSlug } }],
          },
        },
      });

      if (!response.hits.hits[0]?._source) {
        log.error(`No quiz found for lesson slug: ${lessonSlug}. Hit: `);
        // This is caused by the lesson slug not being in the index due to being a non legacy lesson.
        throw new Error(
          `No quiz found for lesson slug: ${lessonSlug}. Returning placeholder quiz.`,
        );
      }
      // Parse the text field if it's a string
      const quizSet = QuizSetSchema.parse(response.hits.hits[0]._source.text);

      return quizSet.is_legacy;
    } catch (error) {
      log.error(
        `Error fetching legacy lesson for lesson slug ${lessonSlug}:`,
        error,
      );
      return false;
    }
  }

  private async searchQuizByLessonSlug(
    lessonSlug: string,
    quizType: QuizPath,
    userId?: string,
  ): Promise<string[]> {
    try {
      const response = await this.client.search<QuizIDSource>({
        index: "lesson-slug-lookup",
        query: {
          bool: {
            must: [{ term: { "metadata.lessonSlug.keyword": lessonSlug } }],
          },
        },
      });

      if (!response.hits.hits[0]?._source) {
        log.error(`No ${quizType} found for lesson slug: ${lessonSlug}. Hit: `);
        // This is caused by the lesson slug not being in the index due to being a non legacy lesson.
        throw new Error(
          `No ${quizType} found for lesson slug: ${lessonSlug}. Returning placeholder quiz.`,
        );
      }

      const source = response.hits.hits[0]._source;
      log.info(`Source: ${JSON.stringify(source)}`);

      // Parse the text field if it's a string
      const quizData: QuizSet =
        typeof source.text === "string" ? JSON.parse(source.text) : source.text;

      let quizIds: string[] | null = null;
      if (quizType === "/starterQuiz") {
        quizIds = quizData.starterQuiz;
      } else if (quizType === "/exitQuiz") {
        quizIds = quizData.exitQuiz;
      }

      if (!quizIds || !z.array(z.string()).safeParse(quizIds).success) {
        log.error(
          `Got invalid ${quizType} data for lesson slug: ${lessonSlug}. Data: ${JSON.stringify(
            quizData,
          )}`,
        );
        throw new Error(
          `Invalid ${quizType} data for lesson slug: ${lessonSlug}. Data: ${JSON.stringify(
            quizData,
          )}`,
        );
      }

      // Check if this is a non-legacy quiz and if the user is allowed to view it
      if (!quizData.is_legacy) {
        let userAllowedNonLegacyQuizzes = false;

        // Check feature flag if userId is provided
        if (userId) {
          userAllowedNonLegacyQuizzes =
            (await posthogAiBetaServerClient.isFeatureEnabled(
              NON_LEGACY_QUIZZES_FLAG,
              userId,
            )) ?? false;

          log.info(
            `User ${userId} ${userAllowedNonLegacyQuizzes ? "is" : "is not"} allowed to see non-legacy quizzes.`,
          );
        }

        if (!userAllowedNonLegacyQuizzes) {
          log.warn(
            `Lesson slug ${lessonSlug} is not legacy. Returning placeholder quiz due to awaiting copyright approval.`,
          );

          return [
            "QUES-XXXXX-XXXXX",
            "QUES-XXXXX-XXXXX",
            "QUES-XXXXX-XXXXX",
            "QUES-XXXXX-XXXXX",
            "QUES-XXXXX-XXXXX",
            "QUES-XXXXX-XXXXX",
          ];
        }
      }
      return quizIds;
    } catch (error) {
      log.error(
        `Error fetching ${quizType} for lesson slug ${lessonSlug}:`,
        error,
      );
      throw error;
    }
  }

  async getStarterQuiz(lessonSlug: string, userId?: string): Promise<string[]> {
    return this.searchQuizByLessonSlug(lessonSlug, "/starterQuiz", userId);
  }

  async getExitQuiz(lessonSlug: string, userId?: string): Promise<string[]> {
    return this.searchQuizByLessonSlug(lessonSlug, "/exitQuiz", userId);
  }

  async hasStarterQuiz(lessonSlug: string, userId?: string): Promise<boolean> {
    try {
      await this.getStarterQuiz(lessonSlug, userId);
      return true;
    } catch {
      return false;
    }
  }

  async hasExitQuiz(lessonSlug: string, userId?: string): Promise<boolean> {
    try {
      await this.getExitQuiz(lessonSlug, userId);
      return true;
    } catch {
      return false;
    }
  }
}
