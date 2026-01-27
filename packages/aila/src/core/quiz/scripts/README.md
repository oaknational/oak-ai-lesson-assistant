# Quiz Dev Scripts

Scripts for debugging and demonstrating the quiz generation system.

## Directory Structure

```
scripts/
├── demo/           # Run pipelines, generate outputs
├── inspection/     # Inspect ES data, audit formats
├── maintenance/    # Cache clearing, seeding
├── helpers/        # Shared utilities
└── README.md
```

## Demo Scripts

### `demo/run-composer.ts`

Run the full LLM quiz composer pipeline with a sample lesson.

```bash
pnpm --filter @oakai/aila with-env tsx src/core/quiz/scripts/demo/run-composer.ts
```

Shows: candidate pools, image processing, LLM reasoning, selected questions.

### `demo/run-image-descriptions.ts`

Run the image description service with sample quiz candidates.

```bash
pnpm --filter @oakai/aila with-env tsx src/core/quiz/scripts/demo/run-image-descriptions.ts
```

Shows: extracted URLs, cache stats, generated descriptions, before/after replacement.

### `demo/generate-image-html.ts`

Generate HTML visualization of images with AI descriptions.

```bash
pnpm --filter @oakai/aila with-env tsx src/core/quiz/scripts/demo/generate-image-html.ts
```

Output: `image-descriptions.html` with visual preview of each image and its description.

## Inspection Scripts

### `inspection/inspect-es-question.ts`

Inspect a single question by UID from Elasticsearch.

```bash
pnpm --filter @oakai/aila with-env tsx src/core/quiz/scripts/inspection/inspect-es-question.ts QUES-EYPJ1-67826
```

Shows: raw ES hit structure, parsed text field, raw_json field.

### `inspection/inspect-lesson-quiz.ts`

Inspect quiz data for a lesson slug or plan ID.

```bash
# By lesson slug
pnpm --filter @oakai/aila with-env tsx src/core/quiz/scripts/inspection/inspect-lesson-quiz.ts circle-theorems-1

# By plan ID
pnpm --filter @oakai/aila with-env tsx src/core/quiz/scripts/inspection/inspect-lesson-quiz.ts --plan-id abc123
```

Shows: questions in lookup table, questions in ES, sync status.

### `inspection/check-raw-json-types.ts`

Audit the ES index for format consistency.

```bash
pnpm --filter @oakai/aila with-env tsx src/core/quiz/scripts/inspection/check-raw-json-types.ts
```

Shows: total docs, object vs array counts, parse error rate.

## Maintenance Scripts

### `maintenance/clear-image-cache.ts`

Clear KV cache for image descriptions.

```bash
pnpm --filter @oakai/aila with-env tsx src/core/quiz/scripts/maintenance/clear-image-cache.ts
```

### `maintenance/create-strict-placeholder.ts`

Create a placeholder question with valid HasuraQuizQuestion schema.

```bash
pnpm --filter @oakai/aila with-env tsx src/core/quiz/scripts/maintenance/create-strict-placeholder.ts
```

Creates: `QUES-XXXXX-STRICT` in Elasticsearch.

## Helpers

### `helpers/elasticsearch-helpers.ts`

- `createElasticsearchClient()` - Create ES client
- `lessonSlugToQuestionIds()` - Find question UIDs for lesson slugs
- `getQuestionsForLesson()` - Get all questions with metadata
- `getQuestionByUid()` - Get specific question by UID

### `helpers/prisma-helpers.ts`

- `getLessonSlugFromPlanId()` - Get slug from plan ID
- `getLessonPlanById()` - Get full lesson plan details
- `findLessonPlansBySlugPattern()` - Search by slug pattern

## Environment Requirements

- `I_DOT_AI_ELASTIC_CLOUD_ID`
- `I_DOT_AI_ELASTIC_KEY`
- `KV_REST_API_URL` / `KV_REST_API_TOKEN` (for cache scripts)
- Database connection (via Prisma, for prisma-helpers)
