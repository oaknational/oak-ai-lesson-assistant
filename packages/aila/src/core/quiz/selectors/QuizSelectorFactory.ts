import type { BaseType } from "../ChoiceModels";
import type { QuizSelector, QuizSelectorFactory } from "../interfaces";
import type { QuizSelectorType } from "../schema";
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
