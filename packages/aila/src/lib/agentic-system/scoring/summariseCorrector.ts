import type { SectionKey } from "../schema";
import type { CorrectorStats } from "../types";

export type CorrectorSummary = {
  corrections_attempted: number;
  corrections_not_needed: number;
  corrections_failed: number;
  correction_rate: string;
  correction_failure_rate: string;
  corrections_by_section: Record<string, number>;
};

/**
 * Pure aggregator. Flattens a list of `CorrectorStats` (one per run of a
 * scenario) into the shape that lands in `scores.yaml` as the
 * `americanisms_corrector` block.
 *
 * Rates are emitted as `"X.X%"` strings so the YAML diff stays human-readable.
 * Division-by-zero is defended: when there are no attempts the failure rate
 * collapses to `"0.0%"` rather than producing `NaN` or being omitted, so the
 * schema stays regular across runs.
 */
export function summariseCorrector(stats: CorrectorStats[]): CorrectorSummary {
  const attempted: SectionKey[] = stats.flatMap((s) => s.attempted);
  const notNeeded: SectionKey[] = stats.flatMap((s) => s.notNeeded);
  const failed = stats.flatMap((s) => s.failed);

  const total = attempted.length + notNeeded.length;
  const rate = (numerator: number, denominator: number): string =>
    denominator === 0
      ? "0.0%"
      : `${((numerator / denominator) * 100).toFixed(1)}%`;

  const correctionsBySection: Record<string, number> = {};
  for (const sectionKey of attempted) {
    correctionsBySection[sectionKey] =
      (correctionsBySection[sectionKey] ?? 0) + 1;
  }

  return {
    corrections_attempted: attempted.length,
    corrections_not_needed: notNeeded.length,
    corrections_failed: failed.length,
    correction_rate: rate(attempted.length, total),
    correction_failure_rate: rate(failed.length, attempted.length),
    corrections_by_section: correctionsBySection,
  };
}
