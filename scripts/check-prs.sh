#!/bin/bash
# Check CI status of open PRs authored by the current user
# Usage: ./scripts/check-prs.sh [PR numbers...]
# If no PR numbers given, checks all open PRs by current user

if [ $# -gt 0 ]; then
  prs="$@"
else
  prs=$(gh pr list --author @me --json number --jq '.[].number')
fi

for pr in $prs; do
  title=$(gh pr view "$pr" --json title --jq '.title')
  echo "=== PR #$pr: $title ==="

  checks=$(gh pr checks "$pr" 2>/dev/null)
  passed=$(echo "$checks" | grep -c "pass" || true)
  pending=$(echo "$checks" | grep -c "pending" || true)
  failed=$(echo "$checks" | grep -c "fail" || true)

  echo "  passed: $passed | pending: $pending | failed: $failed"

  if [ "$failed" -gt 0 ]; then
    echo "  FAILURES:"
    echo "$checks" | grep "fail"
  fi
  if [ "$pending" -gt 0 ]; then
    echo "  PENDING:"
    echo "$checks" | grep "pending"
  fi
  echo ""
done
