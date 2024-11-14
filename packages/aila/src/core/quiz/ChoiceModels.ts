import { z } from "zod";

import { QuizQuestion } from "../../protocol/schema";
import { starterQuizSuitabilitySchema } from "./RerankerStructuedOutputsSchema";

// TODO Abstract this to Schema, choice, evaluator functions to make extensible
// And to be able to use secondary model / LLM to inspect based on justifications.

// TODO make blended comparison functions - i.e taking the same question from each quiz and finding the best one.

const BaseSchema = z.object({
  // Add any common fields here
});

type BaseType = z.infer<typeof BaseSchema>;

// Rating Function Type
type RatingFunction<T extends BaseType> = (item: T) => number;

export function selectHighestRated<T extends BaseType>(
  items: T[],
  ratingFunction: RatingFunction<T>,
): number {
  if (items.length === 0) {
    throw new Error("The input array is empty");
  }

  let highestRatedIndex = 0;
  let highestRating = ratingFunction(items[0]!);
  //   TODO - THIS IS A BUG. WE ARE ASSERTING items[i]! IS NOT NULL (IT SHOULDNT BE BY THE TYPE) BUT WE ARE NOT CHECKING IF IT IS NULL
  if (items.length > 0 && items[0] !== null) {
    for (let i = 1; i < items.length; i++) {
      const currentRating = ratingFunction(items[i]!);
      if (currentRating > highestRating) {
        highestRating = currentRating;
        highestRatedIndex = i;
      }
    }
  }
  return highestRatedIndex;
}
