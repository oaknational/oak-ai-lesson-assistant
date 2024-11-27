import type { z } from "zod";

import { BaseQuizSelector } from "./BaseQuizSelector";
import type { BaseType, RatingFunction } from "./ChoiceModels";
import type { MaxRatingFunctionApplier } from "./ChoiceModels";
import { SimpleQuizSelector } from "./SimpleQuizSelector";
import type { QuizSelector, QuizSelectorFactory } from "./interfaces";
import type { QuizSelectorType } from "./schema";

export class QuizSelectorFactoryImpl implements QuizSelectorFactory {
  public createQuizSelector<T extends BaseType>(
    selectorType: QuizSelectorType,
  ): QuizSelector<T> {
    switch (selectorType) {
      case "simple":
        return new SimpleQuizSelector<T>();
    }
  }
}
