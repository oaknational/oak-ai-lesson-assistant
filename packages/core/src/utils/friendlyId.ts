import murmurhash from "murmurhash";
import {
  adjectives,
  animals,
  colors,
  uniqueNamesGenerator,
} from "unique-names-generator";

/**
 * Convert a string to a numeric seed using MurmurHash3.
 * unique-names-generator accepts string seeds but doesn't hash them properly -
 * it just sums character codes, which causes collisions for different strings.
 * @see https://github.com/andreasonny83/unique-names-generator/issues/79
 */
function stringToSeed(input: string): number {
  return murmurhash.v3(input);
}

/**
 * Generate a friendly ID from an input string (e.g. user ID).
 * Returns a human-readable name like "fid-happy-blue-tiger".
 * The "fid-" prefix distinguishes these from older friendly IDs that
 * used a collision-prone seeding algorithm.
 */
export function generateFriendlyId(input: string): string {
  const name = uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals],
    separator: "-",
    seed: stringToSeed(input),
  });
  return `fid-${name}`;
}
