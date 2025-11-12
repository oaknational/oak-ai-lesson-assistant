# Quiz Generation Scripts

Scripts and helpers for testing and debugging the quiz generation system.

## Image Description Scripts

### `test-image-descriptions.ts`

Test the image description service with a sample lesson plan.

**Usage:**

```bash
pnpm with-env tsx src/core/quiz/scripts/test-image-descriptions.ts
```

**Shows:**

- Extracted image URLs from generated quiz candidates
- Cache hit/miss statistics
- Generated descriptions for each image

### `generate-image-html.ts`

Generate an HTML visualization of image descriptions for manual review.

**Usage:**

```bash
pnpm with-env tsx src/core/quiz/scripts/generate-image-html.ts
```

**Output:** `image-descriptions.html` in the aila package root

**Shows:**

- Visual preview of each image
- AI-generated description
- Image URL
- Cache statistics

### `clear-image-cache.ts`

Clear all cached image descriptions from Redis.

**Usage:**

```bash
pnpm with-env tsx src/core/quiz/scripts/clear-image-cache.ts
```

**Use cases:**

- Testing prompt changes
- Regenerating descriptions with updated models
- Cache maintenance

## Testing Scripts

### `test-composer.ts`

Test the full LLM quiz composer pipeline with both starter and exit quizzes.

**Usage:**

```bash
pnpm with-env tsx src/core/quiz/scripts/test-composer.ts
```

**Shows:**

- Generated candidate pools from semantic search
- Image description processing
- LLM composition strategy and reasoning
- Selected questions with UIDs

### `inspect-lesson-quiz.ts`

Inspect quiz data for a given lesson slug or plan ID.

**Usage:**

```bash
# By lesson slug
pnpm tsx packages/aila/src/core/quiz/scripts/inspect-lesson-quiz.ts circle-theorems-1

# By plan ID
pnpm tsx packages/aila/src/core/quiz/scripts/inspect-lesson-quiz.ts --plan-id abc123
```

**Shows:**

- Questions in lookup table (starter vs exit)
- Questions in Elasticsearch
- Full question metadata
- Sync status between lookup table and Elasticsearch

## Helpers

### `elasticsearch-helpers.ts`

Direct Elasticsearch query functions:

- `createElasticsearchClient()` - Create ES client
- `lessonSlugToQuestionIds()` - Find question UIDs for lesson slugs
- `getQuestionsForLesson()` - Get all questions with metadata
- `getQuestionByUid()` - Get specific question by UID

### `prisma-helpers.ts`

Database query functions:

- `getLessonSlugFromPlanId()` - Get slug from plan ID
- `getLessonPlanById()` - Get full lesson plan details
- `findLessonPlansBySlugPattern()` - Search by slug pattern

## Environment Requirements

These scripts require:

- `I_DOT_AI_ELASTIC_CLOUD_ID`
- `I_DOT_AI_ELASTIC_KEY`
- Database connection (via Prisma)

## Adding New Scripts

When adding new inspection/debugging scripts:

1. Add to this `scripts/` directory
2. Use helpers from `helpers/` directory
3. Make executable with `#!/usr/bin/env tsx`
4. Document usage in this README
5. Use `aiLogger` for consistent output
