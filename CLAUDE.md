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

## Key File Locations

### Moderation System Files (Critical for Current Work)

- **Core Configuration**: `/packages/core/src/utils/ailaModeration/moderationCategories.json`
- **Schema Definitions**: `/packages/core/src/utils/ailaModeration/moderationSchema.ts`
- **Prompt Generation**: `/packages/core/src/utils/ailaModeration/moderationPrompt.ts`
- **AI Processing**: `/packages/aila/src/features/moderation/AilaModeration.ts`
- **API Endpoints**: `/packages/api/src/router/moderations.ts`
- **Database Models**: `/packages/core/src/models/moderations.ts`
- **Frontend Components**: 
  - `/apps/nextjs/src/components/AppComponents/Chat/toxic-moderation-view.tsx`
  - `/apps/nextjs/src/components/AppComponents/FeedbackForms/ModerationFeedbackForm.tsx`
- **Store Management**: `/apps/nextjs/src/stores/moderationStore/`

### Development Configuration

- **Turborepo Config**: `/turbo.json` (defines build tasks and dependencies)
- **Package Configs**: Each package has its own `package.json` with specific scripts
- **ESLint Config**: `/packages/eslint-config/` (shared across monorepo)
- **Prettier Config**: `/packages/prettier-config/` (shared formatting rules)
- **TypeScript**: Root `tsconfig.json` extended by each package
- **Environment**: Use Doppler CLI for secrets management

## Testing Strategy

### Unit Tests
- **Framework**: Jest with TypeScript support
- **Coverage**: Aim for high coverage on business logic
- **Location**: Co-located with source files or in `__tests__` directories
- **Mocking**: Use MSW for API mocking, Jest mocks for utilities

### E2E Tests
- **Framework**: Playwright with TypeScript
- **Location**: `/apps/nextjs/tests-e2e/`
- **Tags**: 
  - `@common-auth`: Tests using shared test user (run concurrently)
  - `@openai`: Tests calling OpenAI API (excluded from CI)
- **Recordings**: Fixtures for AI responses in `/tests-e2e/recordings/`

## Development Environment

### Prerequisites
1. **Node.js**: >=20.9.0 (specified in package.json engines)
2. **pnpm**: >=8 (packageManager: "pnpm@8.6.12")
3. **Docker**: For PostgreSQL database
4. **Doppler CLI**: For secrets management

### Setup Process
1. Clone repository and install dependencies: `pnpm install -r`
2. Install Turbo globally: `pnpm install turbo --global`
3. Set up database: `cd packages/db && pnpm run docker-bootstrap`
4. Configure secrets: `doppler setup && pnpm doppler:pull:dev`
5. Generate Prisma client: `pnpm db-generate`
6. Start development: `pnpm dev`

## Production Considerations

### Performance
- **Bundle Analysis**: Monitor Next.js bundle size
- **Database**: Use Prisma Accelerate for connection pooling
- **Caching**: Leverage tRPC and TanStack Query caching
- **Streaming**: AI responses stream to improve perceived performance

### Security
- **Content Security Policy**: Strict CSP headers implemented
- **API Rate Limiting**: Configured rate limits per user
- **Input Validation**: Comprehensive Zod schemas throughout
- **Authentication**: Clerk handles auth with webhook verification
- **Moderation**: Multi-layer content moderation system

### Monitoring
- **Error Tracking**: Sentry for production error monitoring
- **Performance**: Datadog for application observability
- **Analytics**: PostHog for user behavior tracking
- **Logging**: Structured logging with correlation IDs

## Current Priority: Moderation System Restructure

**Status**: MOD-001 Complete, MOD-002 Complete, MOD-003 Next

The moderation system restructure is underway. Progress:

**✅ MOD-001 (Core Data Structure)**:
1. **✅ Data Structure**: 28 individual categories implemented (was 6 groups)
2. **✅ Scoring**: Individual 1-5 Likert scale scores for each category
3. **✅ Abbreviations**: Short codes implemented (l1, l2, u1-u5, s1, p2-p5, e1, r1-r2, n1-n7, t1-t6)
4. **✅ Schema Updates**: All core schemas and types updated

**✅ MOD-002 (Prompt and LLM Integration)**:
1. **✅ Prompt Generation**: Individual category assessment for all 28 categories
2. **✅ LLM Response Parsing**: Updated to handle new JSON structure
3. **✅ Field Mapping**: LLM `flagged_categories` → internal `categories`
4. **✅ Helper Functions**: Updated for new category structure

**Next**: MOD-003 (API and Database Layer Updates) - update tRPC endpoints and database interactions.

Refer to `SPECIFICATION.md` for complete details and `HISTORY.md` for progress tracking.

# Important Instructions
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
