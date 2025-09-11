# AGENT.md — Pairing Protocol for AI-Assisted Development

> **Trigger:** To start a session, the human says: **“Look at AGENT.md.”** > **Assumptions:** The agent runs with access to MCP tools for **Notion**, **Git**, **Filesystem**, and **Shell**. Pre-commit hooks handle linting/type-checks/tests/Sonar as configured in the repo. The agent follows Conventional Commits and uses the latest library versions **only after checking official docs**.

---

## 0) Workspace & Conventions

- Local workspace root for artifacts: **`.agent/`** (kept local; do **not** commit). The agent SHOULD add `.agent/` to the local exclude list (e.g., `.git/info/exclude`).
- Per-ticket logs: **`.agent/tickets/{ticketId}/`**

  - Index: `.agent/tickets/{ticketId}/index.md`
  - Step logs (created only when a step is ready to test): `.agent/tickets/{ticketId}/step-001.md`, `step-002.md`, ... (zero‑padded to 3 digits; restart per ticket)

- Config file: **`.agent/config.json`** (authoritative). If missing or incomplete, the agent creates/populates it.
- Branch naming: `feat/{ticketId}-{slug}` (e.g., `feat/AI-1565-ticket-title`).
- Commit format: `{type}: [{ticketId}] {stepTitle}` (e.g., `feat: [AI-1565] Implement user search`) where `{type}` is inferred (`feat|fix|refactor|docs|test|chore|build|ci`).
- Ticket ID field name in Notion: **`ID`** (e.g., `AI-1565`).

### `.agent/config.json` schema (minimal)

```json
{
  "baseBranch": "main",
  "notion": {
    "databaseId": "",
    "props": {
      "id": "ID",
      "status": "Status",
      "assignee": "Assignee",
      "priority": "Priority",
      "lastUpdated": "last_edited_time"
    }
  },
  "selection": {
    "inProgressStatuses": ["In Progress"],
    "readyStatuses": ["Ready"],
    "filterAssignee": "me",
    "sort": ["Priority:desc", "LastUpdated:asc"],
    "preferInProgressOverReady": true
  },
  "git": {
    "branchPattern": "feat/{ticketId}-{slug}",
    "commitFormat": "{type}: [{ticketId}] {stepTitle}"
  },
  "attempts": {
    "fixPerStep": 3
  },
  "local": {
    "gitignoreAgentDir": true
  }
}
```

> The agent may auto-populate `notion.databaseId` and `notion.props` by inspecting the configured Notion database. Discovered values are cached back into `config.json`.

---

## 1) Session Pre‑Flight (run in order)

1. **Show intent & confirm repo**: Acknowledge the trigger and display current repo path and default base branch from config (default `main`).
2. **Ensure clean working tree**: Refuse to proceed if there are uncommitted changes; offer to stash if the human confirms.
3. **Sync base**: `git fetch --all --prune`. Verify `origin/{baseBranch}` exists (default `origin/main`). _Do not_ auto-merge/rebase; leave sync decisions to the human.
4. **Config ensure**: If `.agent/config.json` missing, create with defaults above. If fields missing, attempt discovery and write back.
5. **Connect Notion & cache**: Read database schema to confirm property names and available status values; cache to config.
6. **Select ticket** (see §2): choose candidate(s) from Notion based on selection rules; present options.
7. **If none match**: Clearly state “No tickets to pick up” and stop.

---

## 2) Ticket Selection Rules (Notion)

- **Filter:** `Assignee = me` AND `Status ∈ inProgressStatuses ∪ readyStatuses` from config.
- **Priority:** Prefer tickets in `inProgressStatuses` over `readyStatuses`.
- **Sort:** By `Priority` (desc) then `Last Updated` (asc).
- **Human confirmation:** Show top suggestion + 2 alternatives (if any). Proceed only after confirmation.

---

## 3) Ticket Initialization (upon confirmation)

1. **Read snapshot from Notion**: Title (page title), Description (body), Acceptance Criteria (body). If Description and/or AC are missing or vague, propose refined AC for approval.
2. **Update Notion**: Set `Status → In Progress` and `Assignee → me`.
3. **Create feature branch**: `git checkout -b feat/{ticketId}-{slug}` from `{baseBranch}`.
4. **Scaffold ticket folder**: Create `.agent/tickets/{ticketId}/index.md` with:

   - **Ticket Snapshot** (title/description/acceptance criteria)
   - **Working Branch** (name + base branch)
   - **Step Checklist** (empty list; will link `step-XXX.md` as they are created)
   - **Validation Summary** (empty initially)

5. **Propose Steps Plan** (in `index.md`): A concise, ordered outline of the smallest _testable_ steps (5–15 minutes each if possible). **Pause here for approval** — do **not** make code changes yet. The human approves either by saying “looks good” in chat or editing `index.md` and adding `APPROVED ✅` at the end.

---

## 4) Step Loop (repeat until complete)

> Only create the step file **when the step is ready to test**.

1. **Implement the step** (minimal, testable change). Keep scope tiny.
2. **Create step log & propose validation**: Write `.agent/tickets/{ticketId}/step-XXX.md` with:

   - **What was done**: High-level bullets of changes.
   - **How to test**: Exact commands or manual actions to verify (e.g., run a script, open a URL/page, inspect output). Avoid mentioning tests explicitly unless already present in the repo.

3. **Run pre-commit**: Stage changes and trigger the repo’s pre-commit checks. If checks fail, attempt autonomous fixes up to **3** times; append attempts and resolutions to the current step file. If still failing, pause and request human guidance.
4. **Human validation**: The human reviews locally. Approval can be:

   - Chat: “looks good” **and** the agent will append `APPROVED ✅` to the step file, or
   - Directly add a final line: `APPROVED ✅` in `step-XXX.md`.

5. **Commit**: On approval only. Create a Conventional Commit with inferred type and the ticket ID:

   - Example: `feat: [AI-1565] Add debounce to search input`

6. **Index update**: Append a checklist item linking the step log in `index.md` (e.g., `- [x] step-003.md — Add debounce to search input`).

---

## 5) Ticket Completion

1. **Readiness check**: If all planned steps are approved (or plan updated), summarize results in **Validation Summary** within `index.md`.
2. **Final human confirmation**: Ask for final confirmation that the ticket is complete.
3. **Push branch**: `git push -u origin feat/{ticketId}-{slug}`.
4. **Notion**: Do **not** change status on completion (leave as-is per workshop policy).

---

## 6) General Rules & Safeguards

- **Smallest testable increments**: Always aim for the smallest change that can be validated by the human.
- **Library additions**: When adding external libraries, always choose the latest stable version and **consult official documentation**; do not assume prior knowledge of the API.
- **Approvals gate changes**: No commits without explicit approval (`APPROVED ✅`).
- **No auto-rebases/merges**: Leave branch syncing with `main` to the developer.
- **Transparency**: Echo planned actions before running them; keep logs concise.

---

## 7) Templates

### `index.md`

```md
# {ticketId}: {title}

## Ticket Snapshot

- **Title:** {title}
- **Description:**
  {description}
- **Acceptance Criteria:**
  {acceptanceCriteria}

## Working Branch

- **Base:** {baseBranch}
- **Feature Branch:** feat/{ticketId}-{slug}

## Steps Plan

1. {stepTitle1}
2. {stepTitle2}
3. {stepTitle3}

> **Approval:** Add `APPROVED ✅` on a new line at the end of this file to approve the plan.

## Step Checklist

- [ ] (links will appear here as steps are created)

## Validation Summary

- (filled on completion)
```

### `step-XXX.md`

```md
# {ticketId} — Step {N}: {stepTitle}

## What was done

- …

## How to test

- …

---

(Agent/appended notes on fixes or retries go here.)

**Approval:** Add `APPROVED ✅` on a new line at the end of this file to approve this step.
```

---

## 8) Human Commands Cheatsheet

- **Start session:** “Look at AGENT.md.”
- **Pick different ticket:** “Show other options.”
- **Approve steps plan:** Add `APPROVED ✅` to `index.md` (or say “looks good”).
- **Approve a step:** Add `APPROVED ✅` to the relevant `step-XXX.md` (or say “looks good”).
- **Stop after current step:** “Pause after this step.”
- **Summarize progress:** “Summarize ticket progress.”
