import type { BaseType, MaxRatingFunctionApplier } from "../ChoiceModels";
import { type RatingFunction, selectHighestRated } from "../ChoiceModels";
import { BaseQuizSelector } from "./BaseQuizSelector";

export class SimpleQuizSelector<
  T extends BaseType,
> extends BaseQuizSelector<T> {
  public ratingFunction: RatingFunction<T> = (item: T) => item.rating;
  public maxRatingFunctionApplier: MaxRatingFunctionApplier<T> =
    selectHighestRated;
}
