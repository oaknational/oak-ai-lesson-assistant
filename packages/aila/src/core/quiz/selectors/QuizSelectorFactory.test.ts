import { QuizSelectorFactoryImpl } from "./QuizSelectorFactory";
import { SimpleQuizSelector } from "./SimpleQuizSelector";
import type { QuizSelectorType } from "./schema";

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
