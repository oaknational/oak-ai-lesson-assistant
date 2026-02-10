import { prisma } from "@oakai/db";
import { aiLogger } from "@oakai/logger";

import { Client } from "@elastic/elasticsearch";
import type { SearchHit } from "@elastic/elasticsearch/lib/api/types";
import { z } from "zod";

import type { QuizPath } from "../../../protocol/schema";
import { convertHasuraQuizToV3 } from "../../../protocol/schemas/quiz/conversion/rawQuizIngest";
import { hasuraQuizQuestionSchema } from "../../../protocol/schemas/quiz/rawQuiz";
import type {
  QuizIDSource,
  QuizQuestionTextOnlySource,
  QuizSet,
  RagQuizQuestion,
} from "../interfaces";

const log = aiLogger("aila:quiz");

/**
 * Service for retrieving quiz questions in the RAG pipeline.
 * Handles lookups by lesson slug, question IDs, or plan ID.
 */
export class QuizQuestionRetrievalService {
  private readonly client: Client;

  constructor(client?: Client) {
    if (client) {
      this.client = client;
      return;
    }

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

  // === Plan ID lookups (Prisma + ES) ===

  /**
   * Get quiz questions for a lesson plan by its ID.
   * Looks up the lesson slug, finds question IDs, and retrieves full questions.
   */
  async getQuestionsForPlanId(
    planId: string,
    quizType: QuizPath,
  ): Promise<RagQuizQuestion[]> {
    const lessonPlan = await prisma.ragLessonPlan.findUnique({
      where: { id: planId },
      select: { oakLessonSlug: true },
    });

    if (!lessonPlan?.oakLessonSlug) {
      log.warn("Lesson slug not found for planId:", planId);
      throw new Error("Lesson slug not found for planId: " + planId);
    }

    const questionIds = await this.getQuizQuestionIds(
      lessonPlan.oakLessonSlug,
      quizType,
    );
    return this.retrieveQuestionsByIds(questionIds);
  }

  // === Lesson slug lookups (ES) ===

  async getStarterQuizIds(lessonSlug: string): Promise<string[]> {
    return this.getQuizQuestionIds(lessonSlug, "/starterQuiz");
  }

  async getExitQuizIds(lessonSlug: string): Promise<string[]> {
    return this.getQuizQuestionIds(lessonSlug, "/exitQuiz");
  }

  async hasStarterQuiz(lessonSlug: string): Promise<boolean> {
    try {
      const quizIds = await this.getStarterQuizIds(lessonSlug);
      return quizIds.length > 0;
    } catch {
      return false;
    }
  }

  async hasExitQuiz(lessonSlug: string): Promise<boolean> {
    try {
      const quizIds = await this.getExitQuizIds(lessonSlug);
      return quizIds.length > 0;
    } catch {
      return false;
    }
  }

  private async getQuizQuestionIds(
    lessonSlug: string,
    quizType: QuizPath,
  ): Promise<string[]> {
    try {
      const response = await this.client.search<QuizIDSource>({
        index: "lesson-slug-lookup-2025-04-16",
        query: {
          bool: {
            must: [{ term: { "metadata.lessonSlug.keyword": lessonSlug } }],
          },
        },
      });

      if (!response.hits.hits[0]?._source) {
        log.error(`No ${quizType} found for lesson slug: ${lessonSlug}.`);
        return [];
      }

      const source = response.hits.hits[0]._source;

      const quizData: QuizSet =
        typeof source.text === "string" ? JSON.parse(source.text) : source.text;

      const quizIds =
        quizType === "/starterQuiz" ? quizData.starterQuiz : quizData.exitQuiz;

      if (!quizIds || !z.array(z.string()).safeParse(quizIds).success) {
        log.error(
          `Got invalid ${quizType} data for lesson slug: ${lessonSlug}. Data: ${JSON.stringify(quizData)}`,
        );
        throw new Error(
          `Invalid ${quizType} data for lesson slug: ${lessonSlug}. Data: ${JSON.stringify(quizData)}`,
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

  // === Question ID lookups (ES) ===

  /**
   * Retrieves quiz questions by their UIDs from Elasticsearch.
   * Converts to V3 format immediately (supporting all question types).
   * Preserves the order of the input questionUids array.
   */
  async retrieveQuestionsByIds(
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
      const sourceData = JSON.parse(rawQuizString);
      const source = hasuraQuizQuestionSchema.parse(sourceData);
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
