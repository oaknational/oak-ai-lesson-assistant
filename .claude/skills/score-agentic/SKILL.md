---
name: score-agentic
description: Run the agentic scoring harness after changing agent prompts or execution code. Generates a scoring report that must be committed alongside code changes. Use after editing files in packages/aila/src/lib/agentic-system/agents/ or execution/.
user_invocable: true
---

# Agentic Scoring Harness

Run this after making changes to files in `packages/aila/src/lib/agentic-system/agents/` or `execution/`.

The harness runs the agentic lesson generation pipeline multiple times and scores outputs against known behavioural issues. The resulting report must be committed — a CI check will fail if the report's code hash doesn't match the current source.

## Run the harness

```bash
cd packages/aila && SCORE_RUNS=3 pnpm with-env npx jest --testMatch="**/scoring/scoreAgenticIssues.ts" --testTimeout=600000
```

This updates `packages/aila/src/lib/agentic-system/scoring/scores.yaml`.

## Inspect corrector firings

Each scenario in `scores.yaml` now includes an `americanisms_corrector` block summarising how often the British English corrector ran across the scenario's runs:

```yaml
summary:
  full-lesson:
    # …other scorers…
    americanisms_corrector:
      corrections_attempted: 1
      corrections_not_needed: 32
      corrections_failed: 0
      correction_rate: "3.0%"
      correction_failure_rate: "0.0%"
      corrections_by_section:
        cycle3: 1
```

- `corrections_attempted`: sections where the corrector LLM was invoked (i.e. `AilaAmericanisms` flagged an actionable spelling or phrasing issue on that section).
- `corrections_not_needed`: sections that were scanned but had no actionable flags, so the corrector was skipped.
- `corrections_failed`: corrector invocations that threw, returned an error envelope, or produced schema-invalid output. The original section is preserved in these cases.
- `correction_rate`: `corrections_attempted / (corrections_attempted + corrections_not_needed)` as a percentage. Higher means the static prompt guidance is letting more through.
- `correction_failure_rate`: `corrections_failed / corrections_attempted` as a percentage. High values point at corrector model or schema misbehaviour.
- `corrections_by_section`: per-section tally of corrector firings aggregated across all runs in the scenario; useful for spotting which sections leak Americanisms most often.

The corrector attempts a correction when `AilaAmericanisms` detects actionable (spelling/phrasing) Americanisms on a freshly generated section. Each attempt is one additional LLM call. A 0% `correction_rate` means the static prompt guidance caught everything; a high rate means the prompts are leaking and the corrector is doing the heavy lifting. A non-zero `corrections_failed` means the corrector errored or returned schema-invalid content — the original section is preserved, but persistent failures should be investigated.

## Verify freshness

```bash
packages/aila/src/lib/agentic-system/scoring/check-scoring-freshness.sh
```

## Workflow

1. Make changes to agent prompts, instructions, or execution logic
2. Run the scoring harness (command above)
3. Review the report for regressions
4. Review the `americanisms_corrector` block if you changed prompt guidance, the corrector, or `AilaAmericanisms` filters
5. Commit `scores.yaml` alongside your code changes

## Configuration

- `SCORE_RUNS=N`: number of runs per scenario (default 3). Higher values give more confidence but take longer.
