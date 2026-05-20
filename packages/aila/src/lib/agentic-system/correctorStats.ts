import type { CorrectorStats } from "./types";

export const createEmptyCorrectorStats = (): CorrectorStats => ({
  attempted: [],
  notNeeded: [],
  failed: [],
});

/**
 * Used by the scoring harness to accumulate per-turn stats into a per-run
 * total.
 */
export const mergeCorrectorStats = (
  target: CorrectorStats,
  source: CorrectorStats,
): void => {
  target.attempted.push(...source.attempted);
  target.notNeeded.push(...source.notNeeded);
  target.failed.push(...source.failed);
};
