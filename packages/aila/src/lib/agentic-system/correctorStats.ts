import type { CorrectorStats } from "./types";

export const createEmptyCorrectorStats = (): CorrectorStats => ({
  attempted: [],
  notNeeded: [],
  failed: [],
});

/**
 * Append every bucket of `source` onto `target` in place. Used by the scoring
 * harness to accumulate per-turn stats into a per-run total without writing
 * out the three-bucket spread at every call site.
 */
export const mergeCorrectorStats = (
  target: CorrectorStats,
  source: CorrectorStats,
): void => {
  target.attempted.push(...source.attempted);
  target.notNeeded.push(...source.notNeeded);
  target.failed.push(...source.failed);
};
