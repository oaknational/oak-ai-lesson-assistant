import type { Quiz, QuizQuestion } from "../../protocol/schema";
import type { LooseLessonPlan } from "../../protocol/schema";
import { BaseQuizGenerator } from "./AilaQuizVariants";

// RAG-based Quiz Generator
export class BasedOnRagQuizGenerator extends BaseQuizGenerator {
  public async generateQuizFromRagPlanId(planIds: string): Promise<Quiz[]> {
    const lessonSlugs = await this.getLessonSlugFromPlanId(planIds);
    // TODO: add error throwing here if lessonSlugs is null
    const lessonSlugList = lessonSlugs ? [lessonSlugs] : [];
    const customIds = await this.lessonSlugToQuestionIdSearch(lessonSlugList);
    const quiz: QuizQuestion[] =
      await this.questionArrayFromCustomIds(customIds);
    // Now we make the quiz into a 2D array
    const quiz2DArray = [quiz];
    return quiz2DArray;
  }

  async generateMathsStarterQuizPatch(
    lessonPlan: LooseLessonPlan,
  ): Promise<Quiz[]> {
    // If quiz is basedOn, give them the default quiz as a starter quiz
    if (!lessonPlan.basedOn?.id) {
      throw new Error("Lesson plan basedOn is undefined");
    }
    return await this.generateQuizFromRagPlanId(lessonPlan.basedOn?.id);
  }

  async generateMathsExitQuizPatch(
    lessonPlan: LooseLessonPlan,
  ): Promise<Quiz[]> {
    // If quiz is basedOn, give them the default quiz as an exit quiz
    if (!lessonPlan.basedOn?.id) {
      throw new Error("Lesson plan basedOn is undefined");
    }
    return await this.generateQuizFromRagPlanId(lessonPlan.basedOn?.id);
  }
}
