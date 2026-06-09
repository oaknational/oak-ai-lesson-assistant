/* eslint-disable no-console */

/**
 * Shared scaffolding for the scoring eval harnesses (scoreMathsComposer,
 * scorePlannerQuizIntent). Each harness supplies its own cells, per-run scorer
 * and formatters; the run loop, markdown report and YAML output are the same.
 */
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";

/** Minimum shape every scored run shares. */
export type ScoredRun = {
  pass: boolean;
  reasons: string[];
};

/** Minimum shape every eval cell shares. */
export type EvalCellBase = {
  id: string;
  description: string;
  passThreshold: number;
};

export type ScoredCell<TRun extends ScoredRun> = {
  cellId: string;
  description: string;
  passThreshold: number;
  passRate: number;
  runs: TRun[];
};

/** Run every cell `runsPerCell` times, logging progress and computing pass rates. */
export async function runEvalCells<
  TCell extends EvalCellBase,
  TRun extends ScoredRun,
>(
  cells: TCell[],
  runsPerCell: number,
  runOnce: (cell: TCell) => Promise<TRun>,
  formatConsole: (run: TRun) => string,
): Promise<ScoredCell<TRun>[]> {
  const results: ScoredCell<TRun>[] = [];
  for (const cell of cells) {
    console.log(`\n--- ${cell.id} (${runsPerCell} runs) ---`);
    const runs: TRun[] = [];
    for (let i = 0; i < runsPerCell; i++) {
      const run = await runOnce(cell);
      console.log(
        `  Run ${i + 1} ${run.pass ? "✓" : "🚩"} ${formatConsole(run)}`,
      );
      runs.push(run);
    }
    const passRate = runs.filter((r) => r.pass).length / runs.length;
    results.push({
      cellId: cell.id,
      description: cell.description,
      passThreshold: cell.passThreshold,
      passRate,
      runs,
    });
  }
  return results;
}

/** Build the markdown report: a summary table plus per-cell run details. */
export function generateReport<TRun extends ScoredRun>(
  title: string,
  results: ScoredCell<TRun>[],
  runsPerCell: number,
  formatActual: (run: TRun) => string,
): string {
  const lines: string[] = [];
  lines.push(
    `# ${title}`,
    "",
    `Generated: ${new Date().toISOString()}`,
    `Runs per cell: ${runsPerCell}`,
    "",
    "| Cell | Threshold | Pass rate | Status |",
    "|------|-----------|-----------|--------|",
  );
  for (const r of results) {
    let status: string;
    if (r.passThreshold === 0) {
      status = "📊 baseline";
    } else {
      status = r.passRate >= r.passThreshold ? "✓" : "🚩";
    }
    lines.push(
      `| ${r.cellId} | ${(r.passThreshold * 100).toFixed(0)}% | ${(r.passRate * 100).toFixed(0)}% | ${status} |`,
    );
  }
  lines.push("");
  for (const r of results) {
    lines.push(`### ${r.cellId} — ${r.description}`, "");
    for (let i = 0; i < r.runs.length; i++) {
      const run = r.runs[i]!;
      const icon = run.pass ? "✓" : "🚩";
      const reasonStr = run.reasons.length
        ? ` — ${run.reasons.join("; ")}`
        : "";
      lines.push(`- Run ${i + 1} ${icon} ${formatActual(run)}${reasonStr}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

/** Serialise results to the scores YAML file, delegating per-run shape to the caller. */
export function writeScores<TRun extends ScoredRun>(
  outputFile: string,
  results: ScoredCell<TRun>[],
  runsPerCell: number,
  serializeRun: (run: TRun) => unknown,
): void {
  const yamlData = {
    generated: new Date().toISOString(),
    runsPerCell,
    cells: results.map((r) => ({
      id: r.cellId,
      description: r.description,
      passThreshold: r.passThreshold,
      passRate: r.passRate,
      runs: r.runs.map(serializeRun),
    })),
  };
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, YAML.stringify(yamlData));
  console.log(`\nReport written to: ${outputFile}`);
}
