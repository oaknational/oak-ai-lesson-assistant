#!/usr/bin/env bash
#
# Computes a sha256 hash of agentic agent and execution source files.
# Used by both the scoring harness and the freshness check to ensure
# they agree on what "current code" means.
#
# Usage: ./compute-code-hash.sh

set -euo pipefail

# Pin locale so `sort` uses byte-value ordering. Without this, macOS
# (en_US.UTF-8) and Ubuntu CI (POSIX) sort file paths differently,
# producing different concatenation order and therefore different hashes.
export LC_ALL=C

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AGENTIC_DIR="$SCRIPT_DIR/.."

find \
  "$AGENTIC_DIR/agents" \
  "$AGENTIC_DIR/execution" \
  -type f -name '*.ts' \
  ! -name '*.test.ts' \
  ! -path '*__snapshots__*' \
  | sort \
  | xargs cat \
  | shasum -a 256 \
  | cut -d' ' -f1
