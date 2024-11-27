import type { z } from "zod";

import type { BaseType, RatingFunction } from "../ChoiceModels";
import type { MaxRatingFunctionApplier } from "../ChoiceModels";
import type { QuizSelector, QuizSelectorFactory } from "../interfaces";
import type { QuizSelectorType } from "../schema";
import { BaseQuizSelector } from "./BaseQuizSelector";
import { SimpleQuizSelector } from "./SimpleQuizSelector";

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
