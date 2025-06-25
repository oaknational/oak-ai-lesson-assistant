import { aiLogger } from "@oakai/logger";

import type {
  AilaRagRelevantLesson,
  LooseLessonPlan,
  Quiz,
  QuizPath,
} from "../../../protocol/schema";
import type { QuizQuestionWithRawJson } from "../interfaces";
import { BasedOnRagQuizGenerator } from "./BasedOnRagQuizGenerator";

const log = aiLogger("aila:quiz");

// This generates a quiz based on the *Underlying AILA RAG service* relevant lessons.
// TODO: GCLOMAX - Seperate out starter and exit quizzes.
export class AilaRagQuizGenerator extends BasedOnRagQuizGenerator {
  async mappedQuizFromAilaRagRelevantLessons(
    lessonPlan: LooseLessonPlan,
    ailaRagRelevantLessons: AilaRagRelevantLesson[],
    quizType: QuizPath = "/starterQuiz",
  ): Promise<QuizQuestionWithRawJson[][]> {
    log.info(
      "Getting quizzes for relevant lessons:",
      ailaRagRelevantLessons.map((lesson) => "\n- " + lesson.title),
    );
    // TODO: MG - This is a load of DB queries and may make it spiky.
    const quizPromises = ailaRagRelevantLessons.map((relevantLesson) =>
      this.questionArrayFromPlanId(relevantLesson.lessonPlanId, quizType),
    );

    const quizzes = await Promise.all(quizPromises);
    return quizzes.filter((quiz) => quiz.length > 0);
  }

  async generateMathsStarterQuizPatch(
    lessonPlan: LooseLessonPlan,
    ailaRagRelevantLessons: AilaRagRelevantLesson[],
  ): Promise<QuizQuestionWithRawJson[][]> {
    return await this.mappedQuizFromAilaRagRelevantLessons(
      lessonPlan,
      ailaRagRelevantLessons,
      "/starterQuiz",
    );
  }

  //   TODO: GCLOMAX - make this unique for starter and exit quizzes.
  async generateMathsExitQuizPatch(
    lessonPlan: LooseLessonPlan,
    ailaRagRelevantLessons: AilaRagRelevantLesson[],
  ): Promise<QuizQuestionWithRawJson[][]> {
    return await this.mappedQuizFromAilaRagRelevantLessons(
      lessonPlan,
      ailaRagRelevantLessons,
      "/exitQuiz",
    );
  }
}
