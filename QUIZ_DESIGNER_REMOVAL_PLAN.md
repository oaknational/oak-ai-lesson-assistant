# Quiz Designer (QD) Removal Plan

## Overview

This document outlines the plan to remove all Quiz Designer (QD) related code from the codebase while preserving other quiz functionality used in lesson planning.

## Phase 1: Code Removal (Immediate)

### 1. Frontend Pages & Routes

**Delete entire directory:** `apps/nextjs/src/app/quiz-designer/`

- `page.tsx` - Main quiz designer page
- `quiz-designer-page.tsx` - Page component
- `[slug]/page.tsx` - Dynamic route
- `[slug]/generation-page.tsx` - Generation page
- `preview/page.tsx` - Preview functionality
- `preview/[slug]/page.tsx` - Specific quiz preview
- `preview/preview-redirect.tsx` - Preview redirect logic

### 2. State Management & Utilities

**Delete entire directory:** `apps/nextjs/src/ai-apps/quiz-designer/`

- `state/types.ts` - QuizAppState types
- `state/actions.ts` - Redux-style actions
- `state/reducer.ts` - State reducer logic
- `quizRequestGeneration.ts` - AI generation requests
- `extraQuizPromptInfo.ts` - Additional prompt context
- `convertToCSV.ts` - CSV export functionality
- `convertToGIFTFormat.ts` - GIFT format conversion
- `export-helpers.ts` - Export utility functions

### 3. React Components

**Delete entire directory:** `apps/nextjs/src/components/AppComponents/QuizDesigner/`

- Main components:
  - `QuizDesignerPageContent.tsx`
  - `QuizContent.tsx`
  - `Hero.tsx`
  - `ExportMenu.tsx`
  - `QuizRestoreDialog.tsx`
  - `SuggestedQuestions.tsx`
  - `SuggestedQuestionCard.tsx`
  - `DownloadGiftButton.tsx`
- QuizQuestionRow components:
  - `index.tsx`
  - `Question.tsx`
  - `Answer.tsx`
  - `Answers.tsx`
  - `Distractor.tsx`
  - `Distractors.tsx`
  - `ControllerRow.tsx`

### 4. Hooks

**Delete QD-specific hooks from** `apps/nextjs/src/hooks/`:

- `useQuizSession.ts`
- `useSuggestedQuestions.ts`
- `useRegenerateAnswers.ts`
- `useRegenerateDistractors.ts`
- `useExportQuizDesignerSlides.ts`

### 5. API Routes & Endpoints

**Remove from** `packages/api/src/router/exports.ts`:

- `exportQuizDesignerSlides` mutation
- `qdSaveExport` helper function
- `qdGetExportBySnapshotId` helper

**Delete file:** `apps/nextjs/src/app/api/qd-download/route.ts`

**Delete from** `packages/api/src/export/`:

- `exportQuizDesignerSlides.ts`

### 6. Export Package

**Remove from** `packages/exports/`:

- `src/exportQuizDesignerSlides.ts`
- Any QD-specific references in `dataHelpers/prepLessonForSlides.ts`

### 7. Clean Up References

- Remove QD imports from barrel files
- Remove QD from router exports
- Remove feature flag checks for "quiz-designer"
- Clean up any remaining QD references in comments

## Phase 2: Database Changes (Future)

### Database Models to Remove

**Note: These will be removed in a future phase after data migration**

From `packages/db/prisma/schema.prisma`:

```prisma
model QdSnapshot {
  id            String       @id
  snapshotData  Json
  userId        String
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  deletedAt     DateTime?

  qdExports     QdExport[]
}

model QdExport {
  id               String       @id @default(cuid())
  qdSnapshot       QdSnapshot   @relation(fields: [qdSnapshotId], references: [id])
  qdSnapshotId     String
  exportType       LessonExportType
  userId           String
  gdriveFileId     String
  // ... other fields

  downloads        QdExportDownload[]
}

model QdExportDownload {
  id           String      @id @default(cuid())
  qdExport     QdExport    @relation(fields: [qdExportId], references: [id])
  qdExportId   String
  // ... other fields
}
```

### Zod Schemas to Remove

- `packages/db/prisma/zod-schemas/qdexport.ts`
- `packages/db/prisma/zod-schemas/qdsnapshot.ts`
- `packages/db/prisma/zod-schemas/qdexportdownload.ts`

### Migration Strategy

1. Export any necessary data from QD tables
2. Create a migration to drop the tables
3. Remove model definitions and regenerate Prisma client
4. Update any remaining type imports

## What Will Be Preserved

### Essential Quiz Functionality

1. **Lesson Assistant Quizzes**

   - Starter quiz generation (6 questions)
   - Exit quiz generation (6 questions)
   - Quiz V2 format support

2. **Database Models**

   - `QuizQuestion` - General quiz storage
   - `QuizAnswer` - Answer storage with embeddings

3. **Quiz Generation**

   - `/packages/aila/src/core/quiz/` - Core quiz generation
   - `/packages/aila/src/protocol/schemas/quiz/` - V2 schemas
   - Additional materials quiz generation (10 questions)

4. **Quiz Display**

   - `/apps/nextjs/src/components/AppComponents/Chat/Quiz/` - Chat interface components
   - Support for multiple question types (MC, short answer, match, order)

5. **Quiz Infrastructure**
   - Embeddings generation for semantic search
   - Quiz export to Google Docs
   - RAG retrieval for quiz questions

## Testing & Validation

### Pre-removal Checks

1. Verify no active Quiz Designer users
2. Export any necessary QD data
3. Document any QD-specific URLs that will break

### Post-removal Validation

1. Run `pnpm build:dev` - Check for build errors
2. Run `pnpm lint` - Fix any linting issues
3. Run `pnpm type-check` - Ensure type safety
4. Run `pnpm prettier --write .` - Format code
5. Run `pnpm test` - Verify all tests pass
6. Manual testing of lesson quiz generation

## Rollback Plan

1. All changes will be in a single PR
2. Database models remain intact initially
3. Can revert PR if issues arise
4. Feature flag can be re-enabled if needed temporarily

## Timeline

- Phase 1 (Code Removal): Immediate
- Phase 2 (Database Cleanup): After confirming no data loss needed

## Notes

- Quiz Designer was behind "quiz-designer" feature flag
- Used "Qd" prefix for database models
- Completely separate from lesson planning quiz functionality
- No impact on V2 quiz migration work
