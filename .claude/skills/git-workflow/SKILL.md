---
name: git-workflow
description: Oak's git conventions including branch naming (feat/fix/chore prefixes), commit messages (conventional commits format), PR creation with templates, code review process, and CI check monitoring. Use when working with git, creating branches, committing code, or managing pull requests.
---

# Git Workflow

## Branch Naming

- **Feature branches**: `feat/AI-XXXX-description` or `feat/description` (prefer ticket ID when available)
- **Bug fixes**: `fix/description`
- **Chores**: `chore/description` (for project/config changes)
- **Development**: `dev/description`
- **Testing**: `test/description`
- **Spikes**: `spike/description`
- **Refactoring**: `refactor/description`

## Commit Messages

- **Format**: `type: description` (conventional commits)
- **Types**: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `perf:`, `test:`, `build:`, `ci:`, `chore:`, `revert:`
- **Examples**:
  - `feat: add new lesson planner feature`
  - `fix: resolve authentication bug`
  - `docs: update API documentation`

## Quality Gates - How to Know Work is Correct

Before committing or creating a PR, verify all quality checks pass:

### 1. Format Check

```bash
pnpm prettier --write <changed-files>
# Or check all: pnpm prettier --check .
```

### 2. Lint Check

```bash
pnpm lint
# Or with auto-fix: pnpm lint:fix
```

### 3. Type Check

```bash
pnpm type-check
# Or: pnpm check
```

### 4. Tests

```bash
# Run all tests
pnpm test

# Run specific test
pnpm test -- -t "test name pattern"

# Run E2E tests (if relevant)
pnpm test-e2e
```

### Pre-commit Notes

- For small fixes to the last commit, consider using amend
- Never skip hooks (--no-verify, --no-gpg-sign) unless explicitly requested

## Pull Requests

- **Template**: Follow the PR template in `.github/pull_request_template.md`
- **Formatting**: All code must pass `pnpm prettier --check .` before submitting
- **Reviewers**: Ask before adding reviewers (team vs individual depends on context)
  - Team reviews: `gh pr edit <PR-number> --add-reviewer oaknational/ai-devs`
  - Individual reviews: `gh pr edit <PR-number> --add-reviewer username`

## Polling GitHub PR Checks

When waiting for GitHub checks to complete, use this inline pattern:

```bash
# Example: Poll a specific check with timeout
# Usage: Set PR, CHECK_NAME, TIMEOUT (seconds), and INTERVAL (seconds)
PR=733; CHECK_NAME="lint"; TIMEOUT=120; INTERVAL=10; \
end=$(($(date +%s) + TIMEOUT)); \
echo "Polling PR #$PR for '$CHECK_NAME' (timeout: ${TIMEOUT}s)..."; \
while [ $(date +%s) -lt $end ]; do \
  check_status=$(gh pr checks "$PR" | grep "^$CHECK_NAME" | awk '{print $2}'); \
  echo "$(date '+%H:%M:%S') - $CHECK_NAME: ${check_status:-not found}"; \
  [ "$check_status" != "pending" ] && echo "✓ Completed: $check_status" && break; \
  sleep $INTERVAL; \
done || echo "⏱️ Timeout reached"
```

Common checks to poll:

- `lint` - Code style and TypeScript checks
- `test-e2e` - End-to-end tests
- `test-jest` - Unit tests
- `sonarcloud` - Code quality analysis
- `Vercel` - Deployment status
