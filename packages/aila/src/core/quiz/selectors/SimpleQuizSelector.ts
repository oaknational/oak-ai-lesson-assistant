import { aiLogger } from "@oakai/logger";

import type { PartialLessonPlan, QuizPath } from "../../../protocol/schema";
import type {
  QuizQuestionPool,
  QuizQuestionWithRawJson,
  QuizSelector,
  RatingResponse,
} from "../interfaces";

const log = aiLogger("aila:quiz");

export class SimpleQuizSelector implements QuizSelector {
  public async selectQuestions(
    questionPools: QuizQuestionPool[],
    ratings: RatingResponse[],
    _lessonPlan: PartialLessonPlan,
    _quizType: QuizPath,
  ): Promise<QuizQuestionWithRawJson[]> {
    // Find highest rated quiz
    let maxRating = -Infinity;
    let selectedIndex = 0;

    ratings.forEach((rating, index) => {
      if (rating.rating > maxRating) {
        maxRating = rating.rating;
        selectedIndex = index;
      }
    });

    const selectedPool = questionPools[selectedIndex];
    if (!selectedPool) {
      log.error("Selected pool is undefined at index:", selectedIndex);
      throw new Error("Selected pool is undefined");
    }

    log.info(
      `SimpleQuizSelector: selected pool ${selectedIndex} with rating ${maxRating}`,
    );
    return selectedPool.questions;
  }
}
