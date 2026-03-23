#!/bin/bash

FILE_PATH=$(cat | jq -r '.tool_input.file_path // empty')

if echo "$FILE_PATH" | grep -q '/agentic-system/\(agents\|execution\)/'; then
  cat << 'EOF'
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AGENTIC SCORING REMINDER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You edited agentic agent/execution code.
Run /score-agentic before committing.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EOF
fi

exit 0
