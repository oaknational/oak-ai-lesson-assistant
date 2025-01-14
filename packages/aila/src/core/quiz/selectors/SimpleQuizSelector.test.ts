import type { BaseType } from "../ChoiceModels";
import { cachedQuizRatings } from "../fixtures/cachedQuizRatings";
import { type TestRating } from "../rerankers/RerankerStructuredOutputSchema";
import { SimpleQuizSelector } from "./SimpleQuizSelector";

describe("SimpleQuizSelector", () => {
  interface TestItem extends BaseType {
    rating: number;
  }

  const ratings: TestRating[] = cachedQuizRatings;

  it("should use the default rating function to select the highest rated item", () => {
    const selector = new SimpleQuizSelector<TestRating>();
    const highestRatedItem = selector.maxRatingFunctionApplier(
      ratings,
      selector.ratingFunction,
    );

    expect(highestRatedItem).toEqual(0);
  });
});
