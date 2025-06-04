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
- **Test**:
  - All tests: `pnpm test`
  - Single test: `pnpm test -- -t "test name pattern"`
  - E2E tests: `pnpm test-e2e`
  - Coverage: `pnpm test-coverage`
- **Dev**: `pnpm dev` (runs Next.js on port 2525)

## Git Workflow

### Branch Naming

- **Feature branches**: `feat/description` or `feat/AI-XXXX-description`
- **Bug fixes**: `fix/description`
- **Chores**: `chore/description` (for project/config changes)
- **Development**: `dev/description`
- **Testing**: `test/description`
- **Spikes**: `spike/description`
- **Refactoring**: `refactor/description`

### Commit Messages

- **Format**: `type: description` (conventional commits)
- **Types**: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `perf:`, `test:`, `build:`, `ci:`, `chore:`, `revert:`
- **Examples**: 
  - `feat: add new lesson planner feature`
  - `fix: resolve authentication bug`
  - `docs: update API documentation`

### Pull Requests

- **Template**: Follow the PR template in `.github/pull_request_template.md`
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
These IDs are stored in `.claude/env.local.json`:
- **Tasks Database ID**: `NOTION_TASK_DATABASE_ID`
- **Sprints Database ID**: `NOTION_SPRINT_DATABASE_ID`
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
    "filter": {"property": "Sprint", "relation": {"contains": "SPRINT_ID"}},
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
