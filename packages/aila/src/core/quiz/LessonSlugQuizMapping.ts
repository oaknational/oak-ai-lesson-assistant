import type { PrismaClientWithAccelerate } from "@oakai/db";
import { aiLogger } from "@oakai/logger";

import type { LessonSlugQuizLookup, LessonSlugQuizMapping } from "./interfaces";

const log = aiLogger("aila:quiz");

export abstract class BaseLessonQuizLookup implements LessonSlugQuizLookup {
  abstract getStarterQuiz(lessonSlug: string): string[];
  abstract getExitQuiz(lessonSlug: string): string[];
  abstract hasStarterQuiz(lessonSlug: string): boolean;
  abstract hasExitQuiz(lessonSlug: string): boolean;
}

export class InMemoryLessonQuizLookup extends BaseLessonQuizLookup {
  private readonly quizMap: LessonSlugQuizMapping;
  constructor(quizMap: LessonSlugQuizMapping) {
    super();
    this.quizMap = quizMap;
  }

  // These are errors as currently we expect a quiz for every lesson slug. Where these are not available in legacy lessons, we have filled with a placeholder quiz with empty quizzes.
  getStarterQuiz(lessonSlug: string): string[] {
    const starterQuiz = this.quizMap[lessonSlug]?.starterQuiz;
    if (!starterQuiz) {
      log.error(`No starter quiz found for lesson slug: ${lessonSlug}`);
      throw new Error(`No starter quiz found for lesson slug: ${lessonSlug}`);
    }
    return starterQuiz;
  }

  getExitQuiz(lessonSlug: string): string[] {
    const exitQuiz = this.quizMap[lessonSlug]?.exitQuiz;
    if (!exitQuiz) {
      log.error(`No exit quiz found for lesson slug: ${lessonSlug}`);
      throw new Error(`No exit quiz found for lesson slug: ${lessonSlug}`);
    }
    return exitQuiz;
  }

  hasStarterQuiz(lessonSlug: string): boolean {
    return this.quizMap[lessonSlug]?.starterQuiz !== undefined;
  }

  hasExitQuiz(lessonSlug: string): boolean {
    return this.quizMap[lessonSlug]?.exitQuiz !== undefined;
  }
}

// To be implemented later. No factories ect as this will become only implementation.
export class DBLessonQuizLookup extends BaseLessonQuizLookup {
  constructor(private readonly prisma: PrismaClientWithAccelerate) {
    super();
    this.prisma = prisma;
  }

  getStarterQuiz(lessonSlug: string): string[] {
    throw new Error("Not implemented");
  }

  getExitQuiz(lessonSlug: string): string[] {
    throw new Error("Not implemented");
  }

  hasStarterQuiz(lessonSlug: string): boolean {
    throw new Error("Not implemented");
  }

  hasExitQuiz(lessonSlug: string): boolean {
    throw new Error("Not implemented");
  }
}
