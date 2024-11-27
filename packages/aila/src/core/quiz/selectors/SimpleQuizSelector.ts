import type { z } from "zod";

import { BaseQuizSelector } from "./BaseQuizSelector";
import { selectHighestRated, type RatingFunction } from "./ChoiceModels";
import type { MaxRatingFunctionApplier } from "./ChoiceModels";
import type { BaseType } from "./ChoiceModels";
import { BaseSchema } from "./ChoiceModels";

// TODO: GCLOMAX - Why on earth is this not working?????????????
export class SimpleQuizSelector<
  T extends BaseType,
> extends BaseQuizSelector<T> {
  public ratingFunction: RatingFunction<T> = (item: T) => item.rating;
  public maxRatingFunctionApplier: MaxRatingFunctionApplier<T> =
    selectHighestRated;
  //   constructor(
  //     ratingFunction: RatingFunction<T>,
  //     maxRatingFunctionApplier: MaxRatingFunctionApplier<T>,
  //   ) {
  //     super(ratingFunction, maxRatingFunctionApplier);
  //   }
}
