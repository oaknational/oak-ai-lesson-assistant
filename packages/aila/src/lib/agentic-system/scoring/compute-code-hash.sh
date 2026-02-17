#!/usr/bin/env bash
#
# Computes a sha256 hash of agentic agent and execution source files.
# Used by both the scoring harness and the freshness check to ensure
# they agree on what "current code" means.
#
# Usage: ./compute-code-hash.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AGENTIC_DIR="$SCRIPT_DIR/.."

hash_input=$(find \
  "$AGENTIC_DIR/agents" \
  "$AGENTIC_DIR/execution" \
  -type f -name '*.ts' \
  ! -name '*.test.ts' \
  ! -path '*__snapshots__*' \
  | sort \
  | xargs cat)

if command -v sha256sum &>/dev/null; then
  echo "$hash_input" | sha256sum | cut -d' ' -f1
else
  echo "$hash_input" | shasum -a 256 | cut -d' ' -f1
fi
