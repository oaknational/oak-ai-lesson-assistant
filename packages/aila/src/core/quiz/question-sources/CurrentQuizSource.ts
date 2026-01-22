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
import type { HasuraQuizQuestion } from "../../../protocol/schemas/quiz/rawQuiz";
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
      source: this.createSyntheticHasuraSource(question, uid),
      imageMetadata: questionImageMetadata,
    };
  }

  /**
   * Create a synthetic HasuraQuizQuestion source object.
   * Since the question comes from the lesson plan (not Elasticsearch),
   * we construct a minimal source object for compatibility.
   */
  private createSyntheticHasuraSource(
    question: LatestQuizQuestion,
    uid: string,
  ): HasuraQuizQuestion {
    return {
      questionId: 0,
      questionUid: uid,
      questionType: question.questionType,
      questionStem: [{ type: "text", text: question.question }],
      answers: this.convertAnswersToHasuraFormat(question),
      feedback: "",
      hint: question.hint ?? "",
      active: true,
    };
  }

  private convertAnswersToHasuraFormat(
    question: LatestQuizQuestion,
  ): HasuraQuizQuestion["answers"] {
    switch (question.questionType) {
      case "multiple-choice":
        return {
          "multiple-choice": [
            ...question.answers.map((answer) => ({
              answer: [{ type: "text" as const, text: answer }],
              answer_is_correct: true,
            })),
            ...question.distractors.map((distractor) => ({
              answer: [{ type: "text" as const, text: distractor }],
              answer_is_correct: false,
            })),
          ],
        };

      case "short-answer":
        return {
          "short-answer": question.answers.map((answer) => ({
            answer: [{ type: "text" as const, text: answer }],
            answer_is_correct: true,
          })),
        };

      case "match":
        return {
          match: question.pairs.map((pair) => ({
            match_option: [{ type: "text" as const, text: pair.left }],
            correct_choice: [{ type: "text" as const, text: pair.right }],
          })),
        };

      case "order":
        return {
          order: question.items.map((item, idx) => ({
            answer: [{ type: "text" as const, text: item }],
            correct_order: idx + 1,
          })),
        };
    }
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

  async getStarterQuizCandidates(
    lessonPlan: PartialLessonPlan,
    _similarLessons: AilaRagRelevantLesson[],
    _task: Task,
  ): Promise<QuizQuestionPool[]> {
    return this.getCandidates(lessonPlan, "/starterQuiz");
  }

  async getExitQuizCandidates(
    lessonPlan: PartialLessonPlan,
    _similarLessons: AilaRagRelevantLesson[],
    _task: Task,
  ): Promise<QuizQuestionPool[]> {
    return this.getCandidates(lessonPlan, "/exitQuiz");
  }
}
