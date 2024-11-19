import type { z } from "zod";

import { BaseQuizSelector } from "./BaseQuizSelector";
import { selectHighestRated, type RatingFunction } from "./ChoiceModels";
import type { MaxRatingFunctionApplier } from "./ChoiceModels";
import type { BaseType } from "./ChoiceModels";

export class SimpleQuizSelector<
  T extends BaseType,
> extends BaseQuizSelector<T extends BaseType> {
  public ratingFunction: RatingFunction<T> = (item) => item.rating;
  public maxRatingFunctionApplier: MaxRatingFunctionApplier<T> =
    selectHighestRated;

  //   constructor(
  //     ratingFunction: RatingFunction<T>,
  //     maxRatingFunctionApplier: MaxRatingFunctionApplier<T>,
  //   ) {
  //     super(ratingFunction, maxRatingFunctionApplier);
  //   }
}
