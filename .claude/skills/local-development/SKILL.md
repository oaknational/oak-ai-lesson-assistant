---
name: local-development
description: Development server and build commands for Oak AI project including running dev server on port 2525, production and development builds, and running scripts with environment variables. Use when starting local development, building the project, or running scripts.
---

# Local Development

## Development Server

Start the Next.js development server:

```bash
pnpm dev
```

- Runs on port 2525
- Hot reload enabled

## Build Commands

### Production Build

```bash
pnpm build
```

### Development Build

```bash
pnpm build:dev
```

## Running Scripts with Environment Variables

Use `pnpm with-env` to run scripts with environment variables loaded:

```bash
pnpm with-env tsx src/script.ts
```

## Monorepo Structure

This is a Turborepo monorepo using pnpm workspaces. Target specific packages with `--filter`:

```bash
pnpm --filter @oakai/nextjs dev
pnpm --filter @oakai/aila build
```
