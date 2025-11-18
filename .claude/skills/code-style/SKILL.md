---
name: code-style
description: Oak AI project TypeScript coding conventions including naming patterns (kebab-case files, PascalCase components, camelCase functions), component structure, error handling with cause, state management patterns, and tRPC implementation. Use when writing, reviewing, or refactoring code.
---

# Code Style Guide

## General Principles

- **TypeScript**: Strict types with noUncheckedIndexedAccess. Prefer explicit return types.
- **Imports**: Sorted: React → Third-party → Project → Relative
- **Formatting**: 2-space indents, 80 char width, double quotes, trailing commas
- **Function style**: Functional, declarative programming. Avoid classes.
- **Organization**: Modular architecture with clear separation of concerns

## Naming Conventions

- **Files/Directories**: kebab-case (lowercase with dashes)
- **Components**: PascalCase
- **Variables/Functions**: camelCase
- **Types/Interfaces**: PascalCase
- **Constants**: UPPER_CASE for true constants, camelCase for config objects
- **Hooks**: Always prefix with "use" (e.g., useAnalytics)

## Component Structure

- **Component Pattern**: Functional components with hooks
- **Client Components**: Add "use client" directive at the top of file
- **File Organization**:
  - Exported component first
  - Sub-components next
  - Helper functions
  - Type definitions at the end

## State Management

- **Global State**: Zustand stores organized by domain
- **Local State**: React hooks (useState, useReducer)
- **Remote State**: tRPC queries and mutations with TanStack Query

## Error Handling

- **Promise Handling**: Always await promises or use .catch() (enforced by no-floating-promises)
- **Error Patterns**:
  - Early returns with guard clauses
  - Structured error types
  - User-friendly error messages
  - Proper logging
- **Error Cause**: When rethrowing errors, use the `cause` option for better error context:
  ```typescript
  throw new Error("High-level error message", { cause: originalError });
  ```

## tRPC Implementation

- **Router Organization**: By domain/feature
- **Procedure Types**: Query for read, Mutation for write operations
- **Error Handling**: Consistent error responses
- **Middleware**: Authentication, rate limiting, etc.

## Testing Patterns

- **Unit Tests**: Jest for utilities and hooks
- **Component Tests**: React Testing Library
- **E2E Tests**: Playwright
- **Mocking**: Mock external dependencies appropriately
