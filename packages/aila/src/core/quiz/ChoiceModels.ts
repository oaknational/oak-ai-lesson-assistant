import { z } from "zod";

import { QuizQuestion } from "../../protocol/schema";
import { starterQuizSuitabilitySchema } from "./rerankers/RerankerStructuredOutputSchema";

// TODO: GCLOMAX - Abstract this to Schema, choice, evaluator functions to make extensible
// And to be able to use secondary model / LLM to inspect based on justifications.

// TODO: GCLOMAX - make blended comparison functions - i.e taking the same question from each quiz and finding the best one.

export const BaseSchema = z.object({
  // Add any common fields here
  rating: z.number(),
});

export type BaseType = z.infer<typeof BaseSchema>;

// Rating Function Type
export type RatingFunction<T extends BaseType> = (item: T) => number;

export type MaxRatingFunctionApplier<T extends BaseType> = (
  items: T[],
  ratingFunction: RatingFunction<T>,
) => number;

export type RatingFunctionApplier<T extends BaseType> = (
  items: T[],
  ratingFunction: RatingFunction<T>,
) => number[];

// This just applies a rating functon to each item. This is abstracted out to allow for different types of rating functions, for example LLM assesments.
// LLMs on LLMs, it's a brave new world.
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

// Not really needed but useful for typing.
export function ApplyRatingFunction<T extends BaseType>(
  items: T[],
  ratingFunction: RatingFunction<T>,
): number[] {
  return items.map((item) => ratingFunction(item));
}
