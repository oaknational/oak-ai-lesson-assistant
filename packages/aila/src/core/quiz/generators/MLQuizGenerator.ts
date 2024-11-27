// ML-based Quiz Generator
import type { JsonPatchDocument } from "../../../protocol/jsonPatchProtocol";
import type { Quiz, QuizQuestion } from "../../../protocol/schema";
import type { LooseLessonPlan } from "../../../protocol/schema";
import type { CustomHit } from "../interfaces";
import { BaseQuizGenerator } from "./BaseQuizGenerator";

export class MLQuizGenerator extends BaseQuizGenerator {
  private async unpackAndSearch(
    lessonPlan: LooseLessonPlan,
  ): Promise<CustomHit[]> {
    const qq = this.unpackLessonPlanForRecommender(lessonPlan);
    // TODO: GCLOMAX - change this to use the new search service.
    const results = await this.searchWithBM25("oak-vector", "text", qq, 100);
    return results.hits;
  }

  private async generateMathsQuizML(
    lessonPlan: LooseLessonPlan,
  ): Promise<QuizQuestion[]> {
    const hits = await this.unpackAndSearch(lessonPlan);
    const qq = this.unpackLessonPlanForRecommender(lessonPlan);
    const customIds = await this.rerankAndExtractCustomIds(hits, qq);
    const quizQuestions = await this.retrieveAndProcessQuestions(customIds);
    // This should return an array of questions - sometimes there are more than six questions.
    return quizQuestions.slice(0, 6);
  }

  // TODO: GCLOMAX - Change for starter and exit quizzes.
  public async generateMathsStarterQuizPatch(
    lessonPlan: LooseLessonPlan,
  ): Promise<Quiz[]> {
    const quiz: QuizQuestion[] = await this.generateMathsQuizML(lessonPlan);
    // Now we make the quiz into a 2D array
    const quiz2DArray = [quiz];
    return quiz2DArray;
  }
  public async generateMathsExitQuizPatch(
    lessonPlan: LooseLessonPlan,
  ): Promise<Quiz[]> {
    const quiz: QuizQuestion[] = await this.generateMathsQuizML(lessonPlan);
    // Now we make the quiz into a 2D array
    const quiz2DArray = [quiz];
    return quiz2DArray;
  }
}
