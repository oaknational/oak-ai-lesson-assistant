import { aiLogger } from "@oakai/logger";

import type {
  AilaRagRelevantLesson,
  PartialLessonPlan,
  QuizPath,
} from "../../../protocol/schema";
import type {
  LatestQuiz,
  LatestQuizQuestion,
} from "../../../protocol/schemas/quiz";
import type {
  EnrichedImageMetadata,
  QuestionSource,
  QuizQuestionPool,
  RagQuizQuestion,
} from "../interfaces";
import type { Task } from "../reporting";

const log = aiLogger("aila:quiz");

/**
 * Extracts the user's current quiz from the lesson plan so they can modify it.
 * When users request changes like "swap questions 1 and 2" or "change question 4",
 * this source provides the existing quiz as a pool for the LLM to read and modify.
 *
 * Questions are labelled CURRENT-Q1 through CURRENT-Q6 based on position.
 */
export class CurrentQuizSource implements QuestionSource {
  readonly name = "currentQuiz";

  private getCandidates(
    lessonPlan: PartialLessonPlan,
    quizType: QuizPath,
  ): QuizQuestionPool[] {
    const quiz =
      quizType === "/starterQuiz"
        ? lessonPlan.starterQuiz
        : lessonPlan.exitQuiz;

    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
      log.info(`No existing ${quizType} in lesson plan. Returning empty pool.`);
      return [];
    }

    const questions = quiz.questions.map((q, index) =>
      this.convertToRagQuestion(q, index, quiz),
    );

    log.info(
      `Extracted ${questions.length} questions from current ${quizType}`,
    );

    return [
      {
        questions,
        source: {
          type: "currentQuiz",
          quizType,
        },
      },
    ];
  }

  private convertToRagQuestion(
    question: LatestQuizQuestion,
    index: number,
    quiz: LatestQuiz,
  ): RagQuizQuestion {
    const uid = `CURRENT-Q${index + 1}`;

    // Find images used in this question to map relevant imageMetadata
    const questionImageMetadata = this.extractImageMetadataForQuestion(
      question,
      quiz.imageMetadata,
    );

    return {
      question,
      sourceUid: uid,
      // No source - these questions come from the lesson plan, not Hasura
      imageMetadata: questionImageMetadata,
    };
  }

  /**
   * Extract image metadata relevant to a specific question.
   * Matches URLs found in the question text against the quiz-level imageMetadata.
   */
  private extractImageMetadataForQuestion(
    question: LatestQuizQuestion,
    quizImageMetadata: LatestQuiz["imageMetadata"],
  ): EnrichedImageMetadata[] {
    // Gather all text content from the question
    const allText = this.gatherQuestionText(question);

    // Find images referenced in this question
    return quizImageMetadata
      .filter((meta) => allText.includes(meta.imageUrl))
      .map((meta) => ({
        imageUrl: meta.imageUrl,
        attribution: meta.attribution,
        width: meta.width,
        height: meta.height,
      }));
  }

  private gatherQuestionText(question: LatestQuizQuestion): string {
    const parts = [question.question, question.hint ?? ""];

    switch (question.questionType) {
      case "multiple-choice":
        parts.push(...question.answers, ...question.distractors);
        break;
      case "short-answer":
        parts.push(...question.answers);
        break;
      case "match":
        parts.push(...question.pairs.flatMap((p) => [p.left, p.right]));
        break;
      case "order":
        parts.push(...question.items);
        break;
    }

    return parts.join(" ");
  }

  getStarterQuizCandidates(
    lessonPlan: PartialLessonPlan,
    _similarLessons: AilaRagRelevantLesson[],
    _task: Task,
  ): Promise<QuizQuestionPool[]> {
    return Promise.resolve(this.getCandidates(lessonPlan, "/starterQuiz"));
  }

  getExitQuizCandidates(
    lessonPlan: PartialLessonPlan,
    _similarLessons: AilaRagRelevantLesson[],
    _task: Task,
  ): Promise<QuizQuestionPool[]> {
    return Promise.resolve(this.getCandidates(lessonPlan, "/exitQuiz"));
  }
}
