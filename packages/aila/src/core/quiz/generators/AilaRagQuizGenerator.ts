import type { JsonPatchDocument } from "../../../protocol/jsonPatchProtocol";
import type {
  AilaRagRelevantLesson,
  Quiz,
  QuizQuestion,
} from "../../../protocol/schema";
import type { LooseLessonPlan } from "../../../protocol/schema";
import type { CustomHit } from "../interfaces";
import { BasedOnRagQuizGenerator } from "./BasedOnRagQuizGenerator";

// This generates a quiz based on the *Underlying AILA RAG service* relevant lessons.
// TODO: GCLOMAX - Seperate out starter and exit quizzes.
export class AilaRagQuizGenerator extends BasedOnRagQuizGenerator {
  async mappedQuizFromAilaRagRelevantLessons(
    lessonPlan: LooseLessonPlan,
    ailaRagRelevantLessons: AilaRagRelevantLesson[],
  ): Promise<Quiz[]> {
    const quizArray: Quiz[] = [];
    for (const relevantLesson of ailaRagRelevantLessons) {
      quizArray.push(
        await this.questionArrayFromPlanId(relevantLesson.lessonPlanId),
      );
    }
    return quizArray;
  }

  async generateMathsStarterQuizPatch(
    lessonPlan: LooseLessonPlan,
    ailaRagRelevantLessons: AilaRagRelevantLesson[],
  ): Promise<Quiz[]> {
    return await this.mappedQuizFromAilaRagRelevantLessons(
      lessonPlan,
      ailaRagRelevantLessons,
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
    );
  }
}
