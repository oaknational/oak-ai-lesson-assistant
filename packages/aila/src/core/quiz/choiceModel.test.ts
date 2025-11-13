import { selectHighestRated } from "./ChoiceModels";
import type { RatingResponse } from "./rerankers/RerankerStructuredOutputSchema";

const testRatingArray: RatingResponse[] = [
  {
    rating: 0.2,
    justification: "Justification 1",
  },
  {
    rating: 0.8,
    justification: "Justification 2",
  },
  {
    rating: 0.5,
    justification: "Justification 3",
  },
];

describe("Tests Simple Rating function", () => {
  it("it should rate the second index highest", () => {});
  const highestRatedIndex = selectHighestRated(
    testRatingArray,
    (item) => item.rating,
  );
  expect(highestRatedIndex).toBe(1);
});
