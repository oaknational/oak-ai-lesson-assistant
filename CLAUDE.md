# Oak AI Lesson Assistant - Dev Guide

## Repo Structure

- **Turborepo monorepo**: Uses pnpm workspaces
- **Main packages**:
  - `apps/nextjs`: Main Next.js application
  - `packages/aila`: Core AI assistant functionality
  - `packages/api`: tRPC API endpoints
  - `packages/core`: Shared business logic
  - `packages/db`: Prisma schema and database access
  - `packages/exports`: Document export functionality
  - `packages/logger`: Structured logging utilities
  - `packages/eslint-config`: Shared ESLint configuration

## Commands

- **Build**: `pnpm build` (production) or `pnpm build:dev` (development)
- **Lint**: `pnpm lint` or `pnpm lint:fix` to auto-fix issues
- **TypeCheck**: `pnpm type-check` or `pnpm check`
- **Format**: `pnpm prettier --write .` or `pnpm prettier --check .` to check formatting
- **Test**:
  - All tests: `pnpm test`
  - Single test: `pnpm test -- -t "test name pattern"`
  - E2E tests: `pnpm test-e2e`
  - Coverage: `pnpm test-coverage`
- **Dev**: `pnpm dev` (runs Next.js on port 2525)

## Git Workflow

### Branch Naming

- **Feature branches**: `feat/AI-XXXX-description` or `feat/description` (prefer ticket ID when available)
- **Bug fixes**: `fix/description`
- **Chores**: `chore/description` (for project/config changes)
- **Development**: `dev/description`
- **Testing**: `test/description`
- **Spikes**: `spike/description`
- **Refactoring**: `refactor/description`

### Pre-commit Checklist

Before committing any changes, ALWAYS run:

1. `pnpm prettier --check .` - Fix any formatting issues with `pnpm prettier --write .`
2. `pnpm lint` - Fix any linting issues with `pnpm lint:fix`
3. `pnpm type-check` - Resolve any TypeScript errors

### Commit Messages

- **Format**: `type: description` (conventional commits)
- **Types**: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `perf:`, `test:`, `build:`, `ci:`, `chore:`, `revert:`
- **Examples**:
  - `feat: add new lesson planner feature`
  - `fix: resolve authentication bug`
  - `docs: update API documentation`

### Pull Requests

- **Template**: Follow the PR template in `.github/pull_request_template.md`
- **Formatting**: All code must pass `pnpm prettier --check .` before submitting
- **Reviewers**: Ask before adding reviewers (team vs individual depends on context)
- **Team reviews**: `gh pr edit <PR-number> --add-reviewer oaknational/ai-devs`
- **Individual reviews**: `gh pr edit <PR-number> --add-reviewer username`

## Technology Stack

### Frontend

- **Framework**: Next.js with App Router
- **Language**: TypeScript (strict mode)
- **UI Components**: Custom components from Oak National Academy's component library
- **Styling**: Tailwind CSS
- **State Management**:
  - Zustand for complex state (chat, lesson plan, moderation)
  - React hooks for component state
  - tRPC for data fetching and mutations

### Backend

- **Architecture**: tRPC API endpoints for type-safe client-server communication
- **Language**: TypeScript (strict mode)
- **Database**: Prisma ORM with PostgreSQL
- **AI Integration**: OpenAI, Langchain, Claude
- **Authentication**: Clerk

## Code Style

### General

- **TypeScript**: Strict types with noUncheckedIndexedAccess. Prefer explicit return types.
- **Imports**: Sorted: React → Third-party → Project → Relative
- **Formatting**: 2-space indents, 80 char width, double quotes, trailing commas
- **Function style**: Functional, declarative programming. Avoid classes.
- **Organization**: Modular architecture with clear separation of concerns

### Naming Conventions

- **Files/Directories**: kebab-case (lowercase with dashes)
- **Components**: PascalCase
- **Variables/Functions**: camelCase
- **Types/Interfaces**: PascalCase
- **Constants**: UPPER_CASE for true constants, camelCase for config objects
- **Hooks**: Always prefix with "use" (e.g., useAnalytics)

### Component Structure

- **Component Pattern**: Functional components with hooks
- **Client Components**: Add "use client" directive at the top of file
- **File Organization**:
  - Exported component first
  - Sub-components next
  - Helper functions
  - Type definitions at the end

### State Management

- **Global State**: Zustand stores organized by domain
- **Local State**: React hooks (useState, useReducer)
- **Remote State**: tRPC queries and mutations with TanStack Query

### Error Handling

- **Promise Handling**: Always await promises or use .catch() (enforced by no-floating-promises)
- **Error Patterns**:
  - Early returns with guard clauses
  - Structured error types
  - User-friendly error messages
  - Proper logging

### tRPC Implementation

- **Router Organization**: By domain/feature
- **Procedure Types**: Query for read, Mutation for write operations
- **Error Handling**: Consistent error responses
- **Middleware**: Authentication, rate limiting, etc.

### Testing

- **Unit Tests**: Jest for utilities and hooks
- **Component Tests**: React Testing Library
- **E2E Tests**: Playwright
- **Mocking**: Mock external dependencies appropriately

## Notion Integration

### Aila Squad Tasks Database

These IDs are stored in `CLAUDE.local.md` (project memory):

- **Tasks Database ID**: Available in project memory
- **Sprints Database ID**: Available in project memory
- **Access**: Use `mcp__notionApi__API-post-database-query` tool

### How to find current sprint tasks:

1. **Find current sprint**: Query sprints database with filter `{"property": "Sprint status", "status": {"equals": "Current"}}`
2. **Get sprint ID** from the result (e.g., `13d26cc4-e1b1-8108-9fb3-d74429e520c6`)
3. **Query tasks** with filter `{"property": "Sprint", "relation": {"contains": "SPRINT_ID"}}`

### Efficient querying with filter_properties:

- **Essential fields**: `["title", "pPPj", "FH@y", "RIV<", "pIdo"]` (Task, Status, Who, Type, ID)
- **Use filter_properties**: Reduces response size significantly, allows larger page_size (50-100)
- **Example**:
  ```json
  {
    "database_id": "NOTION_TASK_DATABASE_ID",
    "filter": { "property": "Sprint", "relation": { "contains": "SPRINT_ID" } },
    "filter_properties": ["title", "pPPj", "FH@y", "RIV<", "pIdo"],
    "page_size": 50
  }
  ```

### Common task filters:

- In progress: `{"property": "Status", "status": {"equals": "In progress"}}`
- Ready tasks: `{"property": "Status", "status": {"equals": "Ready"}}`
- Ready for review: `{"property": "Status", "status": {"equals": "Ready for review"}}`
- Current sprint tasks: First get current sprint ID, then filter by Sprint relation

### Task Status Meanings:

- **Ready**: Available to pick up and start development
- **Backlog**: Not ready for development yet, needs planning/refinement
- **Candidate**: Being evaluated, not ready for development
- **Triage**: Needs assessment before development
- **In progress**: Currently being worked on
- **Ready for review**: Code complete, awaiting review
- **Merged**: Code merged to main branch
- **Done**: Task completed
- **Blocked**: Cannot proceed due to dependencies

## Engineering Knowledge Integration

### Aila Engineering Knowledge Database

When working on specific technical areas, access relevant documentation from the **Aila Engineering Knowledge** database:

- **Database ID**: `13626cc4-e1b1-8081-a707-ed41c733be1a`
- **Access**: Use `mcp__notionApi__API-post-database-query` tool

### Knowledge Categories and Key Documents

- **Authentication**: `13726cc4-e1b1-8060-a738-feae6ea8ccef` (Clerk integration patterns)
- **Performance**: `17326cc4-e1b1-80c0-ae09-c077e08418dd` (Telemetry), `16126cc4-e1b1-8084-b6f6-f9b095b0c5c6` (react-scan)
- **Testing**: `13726cc4-e1b1-808e-934e-fa32ee120ef4` (Playwright), `14426cc4-e1b1-8005-be60-e1df16c1db3d` (Storybook)
- **Database**: `1e526cc4-e1b1-80e7-bd1c-f9da3fbba138` (Prisma schema drift), `13d26cc4-e1b1-80e2-81e6-decdfaffb334` (Release with migration)
- **Development**: `1e426cc4-e1b1-8005-be60-e1df16c1db3d` (Local setup), `1a426cc4-e1b1-80e6-8d35-f85f63332311` (Zustand stores)
- **Analytics**: `13726cc4-e1b1-8086-a03e-fe3dbce44bdf` (Posthog)
- **Infrastructure**: `1b326cc4-e1b1-8002-a42b-f855c7bf3d92` (Rate limiting), `15026cc4-e1b1-807c-8f86-dcbb53694462` (Feature flags)

### Knowledge Discovery Pattern

Search for relevant knowledge by category:

```json
{
  "database_id": "13626cc4-e1b1-8081-a707-ed41c733be1a",
  "filter": {
    "property": "Category",
    "multi_select": {
      "contains": "CATEGORY_NAME"
    }
  }
}
```

**Available categories**: Authentication, Performance, Testing, Database, Development workflow, Analytics, Infrastructure, Moderation, Health metrics, System maintenance and scheduled tasks

### Knowledge Integration Workflow

1. **Before implementation**: Query knowledge database for relevant docs
2. **During development**: Reference existing patterns and conventions
3. **After changes**: Update documentation if new patterns emerge or existing docs become outdated

### Quick Commands

- **Search knowledge**: `mcp__notionApi__API-post-database-query`
- **Read document**: `mcp__notionApi__API-retrieve-a-page`
- **Update document**: `mcp__notionApi__API-patch-page`
