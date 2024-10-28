/**
 * Alphabetizes an array of comparable elements in-place
 */
import type {
  GenerationPart,
  GenerationPartPlaceholder,
} from "@oakai/core/src/types";

// Function to compare two strings alphabetically
const compareStrings = (a: string, b: string) => {
  return a.localeCompare(b, undefined, { sensitivity: "base" });
};

// Function to alphabetically sort an array of objects or strings
export const sortAlphabetically = (
  array:
    | (GenerationPart<string> | GenerationPartPlaceholder<string>)[]
    | string[]
    | { value: string }[],
) => {
  if (array.length && typeof array[0] === "object" && "value" in array[0]) {
    // If the first element has a 'value' property, assume it's an array of objects
    const compareObjects = (a: { value: string }, b: { value: string }) => {
      return compareStrings(a.value, b.value);
    };
    return (array as { value: string }[]).sort(compareObjects);
  } else {
    // Otherwise, assume it's an array of strings
    return (array as string[]).sort(compareStrings);
  }
};
