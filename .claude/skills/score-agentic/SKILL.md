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

## Verify freshness

```bash
packages/aila/src/lib/agentic-system/scoring/check-scoring-freshness.sh
```

## Workflow

1. Make changes to agent prompts, instructions, or execution logic
2. Run the scoring harness (command above)
3. Review the report for regressions
4. Commit `scores.yaml` alongside your code changes

## Configuration

- `SCORE_RUNS=N` — number of runs per scenario (default 3). Higher values give more confidence but take longer.
