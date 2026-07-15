/**
 * Stands in for the rewrite position in a version-stable stored prompt template,
 * so rewriting different positions doesn't create a new prompt version. Rewrite
 * instructions accept `number | PositionPlaceholder` for the position.
 */
export const POSITION_PLACEHOLDER = "{position}";

export type PositionPlaceholder = typeof POSITION_PLACEHOLDER;
