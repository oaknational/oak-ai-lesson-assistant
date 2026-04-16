import { prisma } from "@oakai/db";
import { aiLogger } from "@oakai/logger";

import type { PrismaClient } from "@prisma/client";

import type { QuizPath } from "../../../protocol/schema";
import type {
  ImageMetadata,
  QuizV3Question,
} from "../../../protocol/schemas/quiz/quizV3";
import type { RagQuizQuestion } from "../interfaces";

const log = aiLogger("aila:quiz");

/**
 * Service for retrieving quiz questions from Postgres (rag.quiz_questions).
 * Handles lookups by lesson slug, question IDs, or plan ID.
 */
export class QuizQuestionRetrievalService {
  private readonly db: PrismaClient;

  constructor(db?: PrismaClient) {
    this.db = db ?? (prisma as unknown as PrismaClient);
  }

  // === Plan ID lookups ===

  /**
   * Get quiz questions for a lesson plan by its ID.
   * Looks up the lesson slug, finds question IDs, and retrieves full questions.
   */
  async getQuestionsForPlanId(
    planId: string,
    quizType: QuizPath,
  ): Promise<RagQuizQuestion[]> {
    const lessonPlan = await this.db.ragLessonPlan.findUnique({
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

  // === Lesson slug lookups ===

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
    // QuizPath comes in as "/starterQuiz" or "/exitQuiz" — strip the leading slash
    const dbQuizType = quizType.replace(/^\//, "");

    try {
      const rows = await this.db.ragQuizQuestion.findMany({
        where: { lessonSlug, quizType: dbQuizType },
        select: { questionUid: true },
        orderBy: { questionPosition: "asc" },
      });

      if (rows.length === 0) {
        log.error(`No ${quizType} found for lesson slug: ${lessonSlug}.`);
        return [];
      }

      return rows.map((r) => r.questionUid);
    } catch (error) {
      log.error(
        `Error fetching ${quizType} for lesson slug ${lessonSlug}:`,
        error,
      );
      throw error;
    }
  }

  // === Question ID lookups ===

  /**
   * Retrieves quiz questions by their UIDs from Postgres.
   * Preserves the order of the input questionUids array.
   */
  async retrieveQuestionsByIds(
    questionUids: string[],
  ): Promise<RagQuizQuestion[]> {
    if (questionUids.length === 0) {
      return [];
    }

    const rows = await this.db.ragQuizQuestion.findMany({
      where: { questionUid: { in: questionUids } },
      select: {
        questionUid: true,
        quizQuestion: true,
        imageMetadata: true,
      },
    });

    if (rows.length === 0) {
      log.error("No questions found for questionUids: ", questionUids);
      return [];
    }

    const parsedQuestions: RagQuizQuestion[] = rows
      .map((row) => this.parseRagQuizQuestion(row))
      .filter((item): item is RagQuizQuestion => item !== null);

    // Sort to match input order — Prisma IN doesn't guarantee order
    const orderedQuestions = questionUids
      .map((uid) => parsedQuestions.find((q) => q.sourceUid === uid))
      .filter((q): q is RagQuizQuestion => Boolean(q));

    return orderedQuestions;
  }

  private parseRagQuizQuestion(row: {
    questionUid: string;
    quizQuestion: unknown;
    imageMetadata: unknown;
  }): RagQuizQuestion | null {
    if (!row.quizQuestion) {
      log.warn("Missing quizQuestion for questionUid:", row.questionUid);
      return null;
    }

    return {
      question: row.quizQuestion as QuizV3Question,
      sourceUid: row.questionUid,
      imageMetadata: (row.imageMetadata as ImageMetadata[]) ?? [],
    };
  }
}
