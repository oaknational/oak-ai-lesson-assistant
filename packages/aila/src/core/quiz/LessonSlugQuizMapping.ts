import { Client } from "@elastic/elasticsearch";
import type { PrismaClientWithAccelerate } from "@oakai/db";
import { aiLogger } from "@oakai/logger";
import type { QuizPath } from "protocol/schema";

import type { QuizIDSource, QuizSet } from "./interfaces";
import type { LessonSlugQuizLookup, LessonSlugQuizMapping } from "./interfaces";

const log = aiLogger("aila:quiz");

export abstract class BaseLessonQuizLookup implements LessonSlugQuizLookup {
  abstract getStarterQuiz(lessonSlug: string): Promise<string[]>;
  abstract getExitQuiz(lessonSlug: string): Promise<string[]>;
  abstract hasStarterQuiz(lessonSlug: string): Promise<boolean>;
  abstract hasExitQuiz(lessonSlug: string): Promise<boolean>;
}

export class InMemoryLessonQuizLookup extends BaseLessonQuizLookup {
  private readonly quizMap: LessonSlugQuizMapping;
  constructor(quizMap: LessonSlugQuizMapping) {
    super();
    this.quizMap = quizMap;
  }

  // These are errors as currently we expect a quiz for every lesson slug. Where these are not available in legacy lessons, we have filled with a placeholder quiz with empty quizzes.
  async getStarterQuiz(lessonSlug: string): Promise<string[]> {
    const starterQuiz = this.quizMap[lessonSlug]?.starterQuiz;
    if (!starterQuiz) {
      // log.error(`No starter quiz found for lesson slug: ${lessonSlug}`);
      throw new Error(`No starter quiz found for lesson slug: ${lessonSlug}`);
    }
    return starterQuiz;
  }

  async getExitQuiz(lessonSlug: string): Promise<string[]> {
    const exitQuiz = this.quizMap[lessonSlug]?.exitQuiz;
    if (!exitQuiz) {
      // log.error(`No exit quiz found for lesson slug: ${lessonSlug}`);
      throw new Error(`No exit quiz found for lesson slug: ${lessonSlug}`);
    }
    return exitQuiz;
  }

  async hasStarterQuiz(lessonSlug: string): Promise<boolean> {
    return this.quizMap[lessonSlug]?.starterQuiz !== undefined;
  }

  async hasExitQuiz(lessonSlug: string): Promise<boolean> {
    return this.quizMap[lessonSlug]?.exitQuiz !== undefined;
  }
}

// To be implemented later. No factories ect as this will become only implementation.
export class DBLessonQuizLookup extends BaseLessonQuizLookup {
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

      const hit = response.hits.hits[0];
      if (!hit || !hit._source) {
        log.error(`No ${quizType} found for lesson slug: ${lessonSlug}. Hit: `);
        throw new Error(`No ${quizType} found for lesson slug: ${lessonSlug}`);
      }

      const source = hit._source;
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

      if (!quizIds || !Array.isArray(quizIds)) {
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
      await this.getStarterQuiz(lessonSlug);
      return true;
    } catch {
      return false;
    }
  }

  async hasExitQuiz(lessonSlug: string): Promise<boolean> {
    try {
      await this.getExitQuiz(lessonSlug);
      return true;
    } catch {
      return false;
    }
  }
}
