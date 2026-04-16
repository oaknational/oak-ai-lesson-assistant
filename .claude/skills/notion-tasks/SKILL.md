---
name: notion-tasks
description: Query and manage Oak AI squad tasks and sprints in Notion. Use when checking current sprint, finding tasks by status, updating task information, or understanding team priorities and workload.
allowed-tools: mcp__notionApi__API-post-database-query, mcp__notionApi__API-retrieve-a-page, mcp__notionApi__API-get-block-children
---

# Notion Task Management

## Setup

Database IDs are stored in `config.local.md` (not checked into git). See `config.local.md.example` for the required format.

## Finding Current Sprint Tasks

1. **Find current sprint**: Query sprints database with filter:

   ```json
   { "property": "Sprint status", "status": { "equals": "Current" } }
   ```

2. **Get sprint ID** from the result (e.g., `13d26cc4-e1b1-8108-9fb3-d74429e520c6`)

3. **Query tasks** with filter:
   ```json
   { "property": "Sprint", "relation": { "contains": "SPRINT_ID" } }
   ```

## Efficient Querying with filter_properties

- **Essential fields**: `["title", "pPPj", "FH@y", "RIV<", "pIdo"]`
  - These map to: Task, Status, Who, Type, ID
- **Use filter_properties**: Reduces response size significantly
- **Page size**: Can use 50-100 when filtering properties

**Example query:**

```json
{
  "database_id": "TASKS_DB_ID",
  "filter": {
    "property": "Sprint",
    "relation": { "contains": "SPRINT_ID" }
  },
  "filter_properties": ["title", "pPPj", "FH@y", "RIV<", "pIdo"],
  "page_size": 50
}
```

## Common Task Filters

- **In progress**: `{"property": "Status", "status": {"equals": "In progress"}}`
- **Ready tasks**: `{"property": "Status", "status": {"equals": "Ready"}}`
- **Ready for review**: `{"property": "Status", "status": {"equals": "Ready for review"}}`
- **Current sprint tasks**: First get current sprint ID, then filter by Sprint relation

## Task Status Meanings

- **Ready**: Available to pick up and start development
- **Backlog**: Not ready for development yet, needs planning/refinement
- **Candidate**: Being evaluated, not ready for development
- **Triage**: Needs assessment before development
- **In progress**: Currently being worked on
- **Ready for review**: Code complete, awaiting review
- **Merged**: Code merged to main branch
- **Done**: Task completed
- **Blocked**: Cannot proceed due to dependencies
