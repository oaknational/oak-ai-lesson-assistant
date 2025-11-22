import type {
  BaseType,
  MaxRatingFunctionApplier,
  RatingFunction,
} from "../ChoiceModels";
import type {
  QuizQuestionPool,
  QuizQuestionWithSourceData,
  QuizSelector,
} from "../interfaces";

export abstract class BaseQuizSelector<T extends BaseType>
  implements QuizSelector<T>
{
  public abstract ratingFunction: RatingFunction<T>;
  public abstract maxRatingFunctionApplier: MaxRatingFunctionApplier<T>;
  public selectBestQuiz(
    questionPools: QuizQuestionPool[],
    ratingsSchemas: T[],
  ): QuizQuestionWithSourceData[] {
    const selectedIndex = this.maxRatingFunctionApplier(
      ratingsSchemas,
      this.ratingFunction,
    );
    const selectedPool = questionPools[selectedIndex];
    if (selectedPool === undefined) {
      throw new Error("Selected quiz pool is undefined");
    }
    return selectedPool.questions;
  }
}
