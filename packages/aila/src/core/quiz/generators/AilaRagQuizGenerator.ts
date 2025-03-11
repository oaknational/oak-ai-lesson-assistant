import type {
  AilaRagRelevantLesson,
  LooseLessonPlan,
  Quiz,
  QuizPath,
} from "../../../protocol/schema";
import { BasedOnRagQuizGenerator } from "./BasedOnRagQuizGenerator";

// This generates a quiz based on the *Underlying AILA RAG service* relevant lessons.
// TODO: GCLOMAX - Seperate out starter and exit quizzes.
export class AilaRagQuizGenerator extends BasedOnRagQuizGenerator {
  async mappedQuizFromAilaRagRelevantLessons(
    lessonPlan: LooseLessonPlan,
    ailaRagRelevantLessons: AilaRagRelevantLesson[],
    quizType: QuizPath = "/starterQuiz",
  ): Promise<Quiz[]> {
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
  ): Promise<Quiz[]> {
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
  ): Promise<Quiz[]> {
    return await this.mappedQuizFromAilaRagRelevantLessons(
      lessonPlan,
      ailaRagRelevantLessons,
      "/exitQuiz",
    );
  }
}
