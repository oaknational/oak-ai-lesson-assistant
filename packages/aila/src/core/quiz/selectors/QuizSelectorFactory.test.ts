import type { QuizSelectorType } from "../schema";
import { QuizSelectorFactoryImpl } from "./QuizSelectorFactory";
import { SimpleQuizSelector } from "./SimpleQuizSelector";

describe("QuizSelectorFactoryImpl", () => {
  let factory: QuizSelectorFactoryImpl;

  beforeEach(() => {
    factory = new QuizSelectorFactoryImpl();
  });

  it('should create a SimpleQuizSelector when selectorType is "simple"', () => {
    const selectorType: QuizSelectorType = "simple";
    const selector = factory.createQuizSelector(selectorType);

    expect(selector).toBeInstanceOf(SimpleQuizSelector);
  });
});
