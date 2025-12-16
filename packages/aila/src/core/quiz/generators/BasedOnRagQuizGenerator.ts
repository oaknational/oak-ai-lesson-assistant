import { aiLogger } from "@oakai/logger";

import type {
  AilaRagRelevantLesson,
  PartialLessonPlan,
  QuizPath,
} from "../../../protocol/schema";
import type {
  AilaQuizCandidateGenerator,
  QuizQuestionPool,
} from "../interfaces";
import { RagQuizRetrievalService } from "../services/RagQuizRetrievalService";

const log = aiLogger("aila:quiz");

/**
 * Generates quiz candidates based on the lesson's "basedOn" source lesson.
 */
export class BasedOnRagQuizGenerator implements AilaQuizCandidateGenerator {
  readonly name = "basedOnRag";

  private retrievalService: RagQuizRetrievalService;

  constructor(retrievalService?: RagQuizRetrievalService) {
    this.retrievalService = retrievalService ?? new RagQuizRetrievalService();
  }

  private async generateQuizCandidates(
    lessonPlan: PartialLessonPlan,
    quizType: QuizPath,
  ): Promise<QuizQuestionPool[]> {
    log.info(
      `Generating maths ${quizType} for lesson plan id:`,
      lessonPlan.basedOn?.id,
    );
    if (!lessonPlan.basedOn?.id) {
      log.info("Lesson plan basedOn is undefined. Returning empty array.");
      return [];
    }
    const questions = await this.retrievalService.getQuestionsForPlanId(
      lessonPlan.basedOn.id,
      quizType,
    );
    return [
      {
        questions,
        source: {
          type: "basedOn",
          lessonPlanId: lessonPlan.basedOn.id,
          lessonTitle: lessonPlan.basedOn.title || "Based on lesson",
        },
      } satisfies QuizQuestionPool,
    ];
  }

  async generateMathsStarterQuizCandidates(
    lessonPlan: PartialLessonPlan,
    _ailaRagRelevantLessons: AilaRagRelevantLesson[],
    _task: Task,
  ): Promise<QuizQuestionPool[]> {
    return this.generateQuizCandidates(lessonPlan, "/starterQuiz");
  }

  async generateMathsExitQuizCandidates(
    lessonPlan: PartialLessonPlan,
    _ailaRagRelevantLessons: AilaRagRelevantLesson[],
    _task: Task,
  ): Promise<QuizQuestionPool[]> {
    return this.generateQuizCandidates(lessonPlan, "/exitQuiz");
  }
}
