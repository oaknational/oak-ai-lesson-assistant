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
cd packages/aila && DEBUG=ai:aila:agents SCORE_RUNS=3 pnpm with-env npx jest --testMatch="**/scoring/scoreAgenticIssues.ts" --testTimeout=600000 2>&1 | tee /tmp/score-agentic.log
```

This updates `packages/aila/src/lib/agentic-system/scoring/scores.yaml` and captures `aila:agents` debug logs (including the British English corrector firing counter) to `/tmp/score-agentic.log` for further analysis.

## Summarise corrector firings

After the harness completes, summarise how often the British English corrector fired:

```bash
fired=$(grep -c "british-english-corrector fired" /tmp/score-agentic.log)
skipped=$(grep -c "british-english-corrector skipped" /tmp/score-agentic.log)
failed=$(grep -cE "british-english-corrector (threw|errored|schema-invalid)" /tmp/score-agentic.log)
total=$((fired + skipped))
if [ "$total" -gt 0 ]; then
  echo "Corrector fired: $fired / $total sections ($(awk "BEGIN { printf \"%.1f\", $fired*100/$total }")%)"
  echo "Skipped:         $skipped / $total sections"
  if [ "$fired" -gt 0 ]; then
    echo "Failed:          $failed / $fired fires ($(awk "BEGIN { printf \"%.1f\", $failed*100/$fired }")%)"
  fi
  echo
  echo "Firings by section:"
  grep "british-english-corrector fired" /tmp/score-agentic.log | sed -E 's/.*fired ([a-zA-Z0-9]+).*/\1/' | sort | uniq -c | sort -rn
else
  echo "No british-english-corrector lines found. Was DEBUG=ai:aila:agents set when running the harness?"
fi
```

The corrector fires when `AilaAmericanisms` detects actionable (spelling/phrasing) Americanisms on a freshly generated section. Each firing is one additional LLM call. A 0% rate means the static prompt guidance caught everything; a high rate means the prompts are leaking and the corrector is doing the heavy lifting. A non-zero "Failed" line means the corrector errored or returned schema-invalid content — the section is preserved (original wins) but the failure should be investigated if it persists.

## Verify freshness

```bash
packages/aila/src/lib/agentic-system/scoring/check-scoring-freshness.sh
```

## Workflow

1. Make changes to agent prompts, instructions, or execution logic
2. Run the scoring harness (command above)
3. Review the report for regressions
4. Review the corrector firing summary if you changed prompt guidance, the corrector, or `AilaAmericanisms` filters
5. Commit `scores.yaml` alongside your code changes

## Configuration

- `SCORE_RUNS=N` — number of runs per scenario (default 3). Higher values give more confidence but take longer.
- `DEBUG=ai:aila:agents` — enables `aiLogger` output for the agentic system, including the corrector firing counter. Without this, the corrector summary above will be empty.
