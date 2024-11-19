import type { z } from "zod";

import { BaseQuizSelector } from "./BaseQuizSelector";
import type { RatingFunction } from "./ChoiceModels";
import type { MaxRatingFunctionApplier } from "./ChoiceModels";
import type { QuizSelector, QuizSelectorFactory } from "./interfaces";

export class QuizSelectorFactoryImpl implements QuizSelectorFactory {
  public createQuizSelector<T extends z.ZodType>(
    ratingFunction: RatingFunction<T>,
    maxRatingFunctionApplier: MaxRatingFunctionApplier<T>,
  ): QuizSelector<T> {
    return new BaseQuizSelector(ratingFunction, maxRatingFunctionApplier);
  }
}
