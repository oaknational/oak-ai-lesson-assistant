#!/usr/bin/env bash
#
# Checks that the agentic scoring report matches the current code.
# Compares the code hash embedded in the report against a fresh hash
# of the agents/ and execution/ source files.
#
# Usage: ./check-scoring-freshness.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPORT="$SCRIPT_DIR/scores.yaml"

if [ ! -f "$REPORT" ]; then
  echo "ERROR: Scoring report not found at $REPORT"
  echo "Run the scoring harness to generate it:"
  echo "  cd packages/aila && SCORE_RUNS=3 pnpm with-env npx jest --testMatch=\"**/scoring/scoreAgenticIssues.ts\" --testTimeout=600000"
  exit 1
fi

report_hash=$(grep '^codeHash:' "$REPORT" | awk '{print $2}')
if [ -z "$report_hash" ]; then
  echo "ERROR: No code hash found in report. Re-run the scoring harness."
  exit 1
fi

current_hash=$("$SCRIPT_DIR/compute-code-hash.sh")

if [ "$report_hash" != "$current_hash" ]; then
  echo "ERROR: Agentic scoring report is stale"
  echo ""
  echo "  Report hash:  $report_hash"
  echo "  Current hash: $current_hash"
  echo ""
  echo "Run the scoring harness to update:"
  echo "  cd packages/aila && SCORE_RUNS=3 pnpm with-env npx jest --testMatch=\"**/scoring/scoreAgenticIssues.ts\" --testTimeout=600000"
  exit 1
fi

echo "Agentic scoring report is up to date (hash: ${current_hash:0:12}...)"
