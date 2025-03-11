import { Client } from "@elastic/elasticsearch";
import { aiLogger } from "@oakai/logger";
import { z } from "zod";

import type { QuizPath } from "../../protocol/schema";
import type { LessonSlugQuizLookup, QuizIDSource, QuizSet } from "./interfaces";

const log = aiLogger("aila:quiz");

export abstract class BaseLessonQuizLookup implements LessonSlugQuizLookup {
  abstract getStarterQuiz(lessonSlug: string): Promise<string[]>;
  abstract getExitQuiz(lessonSlug: string): Promise<string[]>;
  abstract hasStarterQuiz(lessonSlug: string): Promise<boolean>;
  abstract hasExitQuiz(lessonSlug: string): Promise<boolean>;
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

  // Returns a list of quiz IDs for a given lesson slug and quiz type
  private async searchQuizByLessonSlug(
    lessonSlug: string,
    quizType: QuizPath,
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
        // throw new Error(`No ${quizType} found for lesson slug: ${lessonSlug}`);
        return [];
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

      return quizIds;
    } catch (error) {
      log.error(
        `Error fetching ${quizType} for lesson slug ${lessonSlug}:`,
        error,
      );
      throw error;
    }
  }

  async getStarterQuiz(lessonSlug: string): Promise<string[]> {
    return this.searchQuizByLessonSlug(lessonSlug, "/starterQuiz");
  }

  async getExitQuiz(lessonSlug: string): Promise<string[]> {
    return this.searchQuizByLessonSlug(lessonSlug, "/exitQuiz");
  }

  async hasStarterQuiz(lessonSlug: string): Promise<boolean> {
    try {
      const quizIds = await this.getStarterQuiz(lessonSlug);
      return quizIds.length > 0;
    } catch {
      return false;
    }
  }

  async hasExitQuiz(lessonSlug: string): Promise<boolean> {
    try {
      const quizIds = await this.getExitQuiz(lessonSlug);
      return quizIds.length > 0;
    } catch {
      return false;
    }
  }
}
