import type { z } from "zod";

import { BaseQuizSelector } from "./BaseQuizSelector";
import type { BaseType, RatingFunction } from "./ChoiceModels";
import type { MaxRatingFunctionApplier } from "./ChoiceModels";
import { SimpleQuizSelector } from "./SimpleQuizSelector";
import type { QuizSelector, QuizSelectorFactory } from "./interfaces";

export class QuizSelectorFactoryImpl implements QuizSelectorFactory {
  public createQuizSelector<T extends BaseType>(
    ratingFunction: RatingFunction<T>,
    maxRatingFunctionApplier: MaxRatingFunctionApplier<T>,
  ): QuizSelector<T> {
    return new SimpleQuizSelector<T>();
  }
}
