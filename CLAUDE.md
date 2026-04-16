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

## Agentic System

The agentic lesson generation pipeline lives in `packages/aila/src/lib/agentic-system/`. After changing files in the `agents/` or `execution/` folders, run `/score-agentic` before committing. A CI check will fail if the scoring report is stale.

## Additional Documentation

For detailed information on commands, git workflow, code style, and task management, see `.claude/skills/` directory.
