import type { BaseType, MaxRatingFunctionApplier } from "../ChoiceModels";
import { selectHighestRated, type RatingFunction } from "../ChoiceModels";
import { BaseQuizSelector } from "./BaseQuizSelector";

// TODO: GCLOMAX - Why on earth is this not working?????????????
export class SimpleQuizSelector<
  T extends BaseType,
> extends BaseQuizSelector<T> {
  public ratingFunction: RatingFunction<T> = (item: T) => item.rating;
  public maxRatingFunctionApplier: MaxRatingFunctionApplier<T> =
    selectHighestRated;
}
