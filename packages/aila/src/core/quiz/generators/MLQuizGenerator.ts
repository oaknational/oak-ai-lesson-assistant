// ML-based Quiz Generator
import type {
  SearchHit,
  SearchHitsMetadata,
} from "@elastic/elasticsearch/lib/api/types";
import { aiLogger } from "@oakai/logger";

import type {
  LooseLessonPlan,
  Quiz,
  QuizPath,
  QuizQuestion,
} from "../../../protocol/schema";
import { missingQuizQuestion } from "../fixtures/MissingQuiz";
import type { CustomHit, CustomSource } from "../interfaces";
import { BaseQuizGenerator } from "./BaseQuizGenerator";

const log = aiLogger("aila:quiz");
export class MLQuizGenerator extends BaseQuizGenerator {
  private async unpackAndSearch(
    lessonPlan: LooseLessonPlan,
  ): Promise<SearchHit<CustomSource>[]> {
    const qq = this.unpackLessonPlanForRecommender(lessonPlan);
    // TODO: GCLOMAX - change this to use the new search service.
    const results = await this.searchWithBM25("oak-vector", "text", qq, 100);
    return results.hits;
  }

  /**
   * Validates the lesson plan
   * @throws {Error} If the lesson plan is invalid
   */
  private isValidLessonPlan(lessonPlan: LooseLessonPlan | null): void {
    if (!lessonPlan) throw new Error("Lesson plan is null");
    // Check for minimum required properties
    if (
      !(
        ("title" in lessonPlan && "keyStage" in lessonPlan)
        // "topic" in lessonPlan
      )
    ) {
      throw new Error("Invalid lesson plan: missing required properties");
    }
  }

  // Our Rag system may retrieve N Questions. We split them into chunks of 6 to conform with the schema. If we have less than 6 questions we pad with questions from the appropriate section of the lesson plan.
  // If there are no questions for padding, we pad with empty questions.
  private splitQuestionsIntoSixAndPad(
    lessonPlan: LooseLessonPlan,
    quizQuestions: QuizQuestion[],
    quizType: QuizPath,
  ): QuizQuestion[][] {
    const quizQuestions2DArray: QuizQuestion[][] = [];
    log.info(
      `MLQuizGenerator: Splitting ${quizQuestions.length} questions into chunks of 6`,
    );
    const chunkSize = 6;

    const questionsForPadding =
      quizType === "/starterQuiz"
        ? lessonPlan.starterQuiz
        : lessonPlan.exitQuiz;
    // TODO: GCLOMAX - change this to make it consistent - put it out into fixtures.
    // Split questions into chunks of 6
    for (let i = 0; i < quizQuestions.length; i += chunkSize) {
      const chunk = quizQuestions.slice(i, i + chunkSize);

      // If the last chunk has less than 6 questions, pad it with questions from lessonPlan, if not use a default question with a message explaining the issue.
      if (chunk.length < chunkSize && i + chunkSize >= quizQuestions.length) {
        const remainingCount = chunkSize - chunk.length;

        if (questionsForPadding) {
          const paddingQuestions =
            questionsForPadding
              ?.filter(
                (q): q is QuizQuestion =>
                  !!q?.question && !!q?.answers && !!q?.distractors,
              )
              .slice(0, remainingCount) ||
            Array(remainingCount).fill(missingQuizQuestion);
          chunk.push(...paddingQuestions);
        } else {
          const paddingQuestions: QuizQuestion[] =
            Array(remainingCount).fill(missingQuizQuestion);
          chunk.push(...paddingQuestions);
        }
      }
      quizQuestions2DArray.push(chunk);
    }

    return quizQuestions2DArray;
  }

  // This should return an array of questions - sometimes there are more than six questions, these are split later.
  private async generateMathsQuizML(
    lessonPlan: LooseLessonPlan,
  ): Promise<QuizQuestion[]> {
    this.isValidLessonPlan(lessonPlan);
    const hits = await this.unpackAndSearch(lessonPlan);
    const qq = this.unpackLessonPlanForRecommender(lessonPlan);
    const customIds = await this.rerankAndExtractCustomIds(hits, qq);
    const quizQuestions = await this.retrieveAndProcessQuestions(customIds);
    return quizQuestions;
  }

  // TODO: GCLOMAX - Change for starter and exit quizzes.
  public async generateMathsStarterQuizPatch(
    lessonPlan: LooseLessonPlan,
  ): Promise<Quiz[]> {
    const quiz: QuizQuestion[] = await this.generateMathsQuizML(lessonPlan);
    const quiz2DArray = this.splitQuestionsIntoSixAndPad(
      lessonPlan,
      quiz,
      "/starterQuiz",
    );
    log.info(`MLGenerator: Generated ${quiz2DArray.length} starter Quizzes`);
    return quiz2DArray;
  }
  public async generateMathsExitQuizPatch(
    lessonPlan: LooseLessonPlan,
  ): Promise<Quiz[]> {
    const quiz: QuizQuestion[] = await this.generateMathsQuizML(lessonPlan);
    const quiz2DArray = this.splitQuestionsIntoSixAndPad(
      lessonPlan,
      quiz,
      "/exitQuiz",
    );
    log.info(`MLGenerator: Generated ${quiz2DArray.length} exit questions`);
    return quiz2DArray;
  }
}
