import type { QuizQuestion } from "../../../protocol/schema";
import type {
  BaseType,
  MaxRatingFunctionApplier,
  RatingFunction,
} from "../ChoiceModels";
import type { QuizSelector } from "../interfaces";

export abstract class BaseQuizSelector<T extends BaseType>
  implements QuizSelector<T>
{
  public abstract ratingFunction: RatingFunction<T>;
  public abstract maxRatingFunctionApplier: MaxRatingFunctionApplier<T>;
  public selectBestQuiz(
    quizzes: QuizQuestion[][],
    ratingsSchemas: T[],
  ): QuizQuestion[] {
    const selectedIndex = this.maxRatingFunctionApplier(
      ratingsSchemas,
      this.ratingFunction,
    );
    const selectedQuiz = quizzes[selectedIndex];
    if (selectedQuiz === undefined) {
      throw new Error("Selected quiz is undefined");
    }
    return selectedQuiz;
  }
}
