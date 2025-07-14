# Quiz V2 Migration Plan

## Executive Summary

**Purpose**: Migrate quiz format from V1 (simple array) to V2 (discriminated union supporting multiple question types)

**Current Status**:

- ✅ **Backend Migration**: Complete - LLM generates V2, database auto-upgrades V1
- 🚧 **UI Components**: Draft PRs created for new question types (#740, #741, #742)
- 🚧 **RAG Integration**: Planning phased extraction from PR #724
- ❌ **Export Support**: Only multiple-choice supported, other types filtered out

**Key Limitation**: LLM only generates multiple-choice questions. Other types (short-answer, match, order) are for future RAG integration.

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [Migration Strategy (Historical)](#migration-strategy)
4. [Implementation Status](#implementation-status)
5. [Current Work in Progress](#current-work-in-progress)
6. [Next Steps](#next-steps)
7. [Technical Reference](#technical-reference)

---

## Current State Analysis

### Schema Structure

- **V1 Schema** (`packages/aila/src/protocol/schemas/quiz/quizV1.ts`):
  - Simple array of questions: `QuizV1Question[]`
  - Only supports multiple-choice
  - Structure: `{ question: string, answers: string[], distractors: string[] }`
  - Has `QuizV1SchemaWithoutLength`, `QuizV1Schema`, `QuizV1OptionalSchema` variants
  - Legacy format, array-based
- **V2 Schema** (`packages/aila/src/protocol/schemas/quiz/quizV2.ts`):
  - Discriminated union supporting multiple quiz types
  - Structure: `{ version: "v2", questions: QuizV2Question[] }`
  - Multiple choice format: `{ questionType: "multiple-choice", question, answers, distractors, hint? }`
  - Also supports: short-answer, match, order (but LLM will only generate multiple-choice)
  - Currently has: `QuizV2Schema`, `QuizV2SchemaWithoutLength`, `QuizV2OptionalSchema`

### Current LLM Integration Points

- **Agents** (`packages/aila/src/lib/agents/agents.ts`):

  - `starterQuiz` agent (lines 176-186):
    - `schemaForLLM: QuizV1SchemaWithoutLength`
    - `schemaStrict: QuizV1SchemaStrictMax6Schema`
  - `exitQuiz` agent (lines 205-212):
    - `schemaForLLM: QuizV1SchemaWithoutLength`
    - `schemaStrict: QuizV1SchemaStrictMax6Schema`
  - Both use structured outputs for quiz generation

**SCOPE NOTE**: This migration only covers `starterQuiz` and `exitQuiz`. The `checkForUnderstanding` questions within learning cycles use a different schema and are NOT part of this migration.

- **Main Schema** (`packages/aila/src/protocol/schema.ts`):
  - `CompletedLessonPlanSchema` uses `QuizV1Schema` for:
    - `starterQuiz` (line 371)
    - `exitQuiz` (line 375)
  - `CompletedLessonPlanSchemaWithoutLength` uses `QuizV1SchemaWithoutLength` for:
    - `starterQuiz` (line 524)
    - `exitQuiz` (line 530)

### Conversion Logic

- **V1 to V2 Conversion** (`packages/aila/src/protocol/schemas/quiz/conversion/quizV1ToV2.ts`):
  - `convertQuizV1QuestionToV2(questionV1: QuizV1Question): QuizV2Question`
  - `convertQuizV1ToV2(quizV1: QuizV1): QuizV2`
  - `detectQuizVersion(quiz: QuizV1 | QuizV2): "v1" | "v2" | "unknown"`
  - Already handles conversion from V1 array format to V2 object format

### Rendering Logic

- **Section to Markdown** (`packages/aila/src/protocol/sectionToMarkdown.ts`):
  - `organiseAnswersAndDistractors()` function (lines 182-206)
  - Currently expects `QuizV1Optional` format
  - Renders quiz questions with answers and distractors
  - **Note**: User clarified we don't need to change this - components will only support V2

### Agent Configuration

- **Section Agent Map** (`packages/aila/src/lib/agents/agents.ts` lines 261-275):
  - Maps lesson plan sections to agents
  - `starterQuiz` and `exitQuiz` have special handling for maths subject
  - Both default to their respective quiz agents

## Migration Strategy (Historical)

> **Note**: This section documents the original migration plan. See [Implementation Status](#implementation-status) for what was actually completed.

### Phase 1: Create V2 LLM-Specific Schemas

**Goal**: Create V2 schemas that are appropriate for LLM generation (multiple-choice only)

1. **Add to `packages/aila/src/protocol/schemas/quiz/quizV2.ts`**:

   ```typescript
   // LLM-specific schemas (multiple-choice only)
   export const QuizV2MultipleChoiceOnlyQuestionSchema =
     QuizV2QuestionMultipleChoiceSchema;

   export const QuizV2MultipleChoiceOnlySchema = z.object({
     version: z.literal("v2"),
     questions: z.array(QuizV2MultipleChoiceOnlyQuestionSchema),
   });

   export const QuizV2MultipleChoiceOnlySchemaWithoutLength =
     QuizV2MultipleChoiceOnlySchema;
   export const QuizV2MultipleChoiceOnlyOptionalSchema =
     QuizV2MultipleChoiceOnlySchema.optional();
   export const QuizV2MultipleChoiceOnlyStrictMax6Schema =
     QuizV2MultipleChoiceOnlySchema.extend({
       questions: z.array(QuizV2MultipleChoiceOnlyQuestionSchema).min(1).max(6),
     });
   ```

2. **Add type exports**:
   ```typescript
   export type QuizV2MultipleChoiceOnly = z.infer<
     typeof QuizV2MultipleChoiceOnlySchema
   >;
   export type QuizV2MultipleChoiceOnlyOptional = z.infer<
     typeof QuizV2MultipleChoiceOnlyOptionalSchema
   >;
   ```

### Phase 2: Update Schema Exports

**Goal**: Make new schemas available throughout the codebase

1. **Update `packages/aila/src/protocol/schemas/quiz/index.ts`**:
   - Add exports for new LLM-specific schemas
   - Ensure all V2 schemas are properly exported

### Phase 3: Update LLM Agent Configuration

**Goal**: Make LLM generate V2 format quizzes

1. **Update `packages/aila/src/lib/agents/agents.ts`**:

   - Import new V2 schemas
   - Replace `QuizV1SchemaWithoutLength` with `QuizV2MultipleChoiceOnlySchemaWithoutLength`
   - Replace `QuizV1SchemaStrictMax6Schema` with `QuizV2MultipleChoiceOnlyStrictMax6Schema`
   - Update both `starterQuiz` and `exitQuiz` agents

2. **Update `packages/aila/src/protocol/schema.ts`**:
   - Replace `QuizV1Schema` with `QuizV2Schema` in `CompletedLessonPlanSchema`
   - Replace `QuizV1SchemaWithoutLength` with `QuizV2SchemaWithoutLength` in `CompletedLessonPlanSchemaWithoutLength`

### Phase 4: Update Database Loading Logic

**Goal**: Silently upgrade existing V1 quizzes to V2 when loading lesson plans

1. **Find lesson plan loading code**:

   - Look for Prisma queries that fetch lesson plans
   - Likely in API routes or tRPC procedures
   - Search for files that import lesson plan schemas

2. **Add silent upgrade logic**:
   - Use `detectQuizVersion()` to check quiz format
   - Use `convertQuizV1ToV2()` to upgrade V1 quizzes
   - Apply to both `starterQuiz` and `exitQuiz` fields
   - Save upgraded lesson plans back to database

### Phase 5: Update Type Definitions

**Goal**: Update all type references from V1 to V2

1. **Update lesson plan types**:

   - Replace `QuizV1` with `QuizV2` in lesson plan interfaces
   - Replace `QuizV1Optional` with `QuizV2Optional`
   - Update streaming and partial types

2. **Update function signatures**:
   - Any functions that accept/return quiz data
   - Update extractRagData functions in agents

### Phase 6: Testing & Validation

**Goal**: Ensure everything works correctly

1. **Test schema changes**:

   - Verify structured outputs work with V2 schemas
   - Test streaming functionality
   - Ensure validation works correctly

2. **Test conversion logic**:
   - Test V1 to V2 conversion in database loading
   - Test both new lesson plans and existing ones
   - Verify no data loss during conversion

## Key Technical Details

### V1 vs V2 Structure Comparison

```typescript
// V1 Format (array of questions)
type QuizV1 = Array<{
  question: string;
  answers: string[];
  distractors: string[];
}>;

// V2 Format (object with version and discriminated union questions)
type QuizV2 = {
  version: "v2";
  questions: Array<{
    questionType: "multiple-choice";
    question: string;
    answers: string[];
    distractors: string[];
    hint?: string;
  }>;
};
```

### Conversion Logic

```typescript
// V1 to V2 conversion maintains all data
const v2Question = {
  questionType: "multiple-choice" as const,
  question: v1Question.question,
  answers: v1Question.answers,
  distractors: v1Question.distractors,
  hint: undefined, // V1 doesn't have hints
};
```

### LLM Considerations

- V2 multiple-choice format is compatible with current prompts
- Structured outputs should work with discriminated union
- May need to update prompts to be explicit about V2 format
- LLM will only generate multiple-choice questions (subset of V2 capabilities)

## Implementation Status

### ✅ Backend Migration - COMPLETE

1. **V2 LLM-specific schemas created** (`packages/aila/src/protocol/schemas/quiz/quizV2.ts`)

   - `QuizV2MultipleChoiceOnlySchema` and variants
   - LLM can only generate multiple-choice questions (subset of V2)

2. **LLM agents updated** (`packages/aila/src/lib/agents/agents.ts`)

   - `starterQuiz` and `exitQuiz` agents now use V2 schemas
   - `schemaForLLM: QuizV2MultipleChoiceOnlySchemaWithoutLength`
   - `schemaStrict: QuizV2MultipleChoiceOnlyStrictMax6Schema`

3. **Main lesson plan schema updated** (`packages/aila/src/protocol/schema.ts`)

   - `CompletedLessonPlanSchema` uses `QuizV2Schema`
   - `LessonPlanSectionWhileStreaming` type updated to `QuizV2Optional`

4. **Database loading with silent V1 to V2 upgrade**

   - `packages/aila/src/features/persistence/adaptors/prisma/index.ts`
   - `packages/api/src/router/appSessions.ts`
   - Added `upgradeLessonPlanQuizzes()` function that detects V1 and converts to V2
   - Silent upgrade on lesson plan load

5. **Test fixtures updated**
   - `packages/aila/src/core/quiz/fixtures/CircleTheoremsExampleOutput.ts`
   - Updated from V1 array format to V2 object format with `questionType`

### ✅ Frontend & Export Updates - COMPLETE

6. **Exports package updates** (`packages/exports/`)

   - ✅ Schema updated to support V2 format with all question types
   - ✅ Updated all helper functions (`prepQuizForDocs.ts`, `prepLessonForSlides.ts`, `prepLessonPlanForDocs.ts`)
   - ✅ All `quiz[index]` → `quiz.questions[index]` patterns updated
   - ✅ Created `filterToMcQuestions` utility function for filtering to MC-only
   - ✅ TypeScript errors fixed with proper type exports
   - ✅ Passes linting with only minor warnings
   - ✅ Prettier formatting applied
   - 📝 See [quiz-v2-exports-deep-dive.md](./quiz-v2-exports-deep-dive.md) for detailed analysis

   **⚠️ IMPORTANT LIMITATION:**

   - **Exports (PDF/Slides) only support multiple-choice questions**
   - Other question types (short-answer, match, order) are filtered out using `filterToMcQuestions`
   - This is a deliberate design decision to maintain compatibility with existing templates
   - TODO comments added in code for future enhancement when templates support other types

7. **Frontend store updates**

   - ✅ Updated default state objects in `apps/nextjs/src/stores/resourcesStore/index.ts`
   - ✅ Changed empty arrays `[]` to V2 format `{ version: "v2", questions: [] }`

8. **Frontend component fixes**
   - ✅ Fixed type errors in storybook stories (`LessonPlanProgressDropdown.stories.tsx`)
   - ✅ Updated test fixtures to use V2 format with proper TypeScript literals
   - ✅ Fixed experimental quiz field handling in `static-lesson-plan-renderer.tsx`
   - ✅ Added V1 to V2 conversion in `lessonPlanStore` selectors
   - ✅ Fixed `checkForUnderstanding` in storybook to use V2 format
   - ✅ Implemented quiz V2 rendering components:
     - Created `QuizSection` component that validates and converts V1 to V2
     - Created `MultipleChoiceQuestion` component with Oak styling
     - Fixed quiz question number alignment and spacing
     - Added support for images in questions and answers
     - Fixed section header spacing in static lesson plan renderer

### ⏸️ Production Validation - PENDING

9. **Testing and validation**
   - ✅ Type checking passes across all packages
   - ✅ Linting passes (fixed unused import in quizV1ToV2.ts)
   - ✅ Unit tests pass (lessonPlanCompleted test fixed)
   - ✅ Prettier formatting applied to all changed files
   - ⏸️ Verify structured outputs work with V2 schemas in development
   - ⏸️ Test lesson plan loading and automatic V1→V2 upgrade in production
   - ⏸️ Test new lesson plan creation with V2 quizzes
   - ⏸️ GitHub CI/CD checks

### ✅ Database Migration Script - READY (PR #736)

10. **Migration script for existing data**

- ✅ Created `packages/db/scripts/migrations/migrate-quizzes-to-v2.ts`
- ✅ Uses centralized `upgradeQuizzes` function from aila package
- ✅ Supports dry-run mode to preview changes
- ✅ Includes comprehensive test suite
- ✅ Successfully tested locally with test data
- ✅ Fixed to use relative imports for CI compatibility
- ✅ Ready to run on staging/production AFTER automatic V2 upgrade is deployed

**⚠️ IMPORTANT**: The migration script should only be run AFTER the automatic V1→V2 upgrade logic (from the main quiz V2 branch) is deployed to staging/production. Running it before would convert all quizzes to V2, but the application wouldn't know how to handle them yet.

**Usage**:

```bash
# Local (uses .env)
pnpm --filter @oakai/db with-env tsx scripts/migrations/migrate-quizzes-to-v2.ts --dry-run

# Staging (uses doppler)
doppler run --config stg -- pnpm tsx packages/db/scripts/migrations/migrate-quizzes-to-v2.ts --dry-run

# Production (uses doppler)
doppler run --config prd -- pnpm tsx packages/db/scripts/migrations/migrate-quizzes-to-v2.ts --dry-run
```

## Technical Reference

### Schema Changes

```typescript
// V1 Format (old)
type QuizV1 = Array<{
  question: string;
  answers: string[];
  distractors: string[];
}>;

// V2 Format (new)
type QuizV2 = {
  version: "v2";
  questions: Array<{
    questionType: "multiple-choice";
    question: string;
    answers: string[];
    distractors: string[];
    hint?: string;
  }>;
};
```

### Database Upgrade Logic

```typescript
function upgradeLessonPlanQuizzes(lessonPlan: any): any {
  if (
    lessonPlan.starterQuiz &&
    detectQuizVersion(lessonPlan.starterQuiz) === "v1"
  ) {
    lessonPlan.starterQuiz = convertQuizV1ToV2(lessonPlan.starterQuiz);
  }
  if (lessonPlan.exitQuiz && detectQuizVersion(lessonPlan.exitQuiz) === "v1") {
    lessonPlan.exitQuiz = convertQuizV1ToV2(lessonPlan.exitQuiz);
  }
  return lessonPlan;
}
```

### LLM Configuration

- Agents now use `QuizV2MultipleChoiceOnlySchemaWithoutLength` for structured outputs
- Only generates multiple-choice questions (compatible with existing prompts)
- Maintains backward compatibility through database upgrade

---

## Summary of Completed Work

**🎉 BACKEND MIGRATION COMPLETE**

The quiz V2 migration is functionally complete for starter and exit quizzes:

- ✅ LLM agents updated to generate V2 format quizzes
- ✅ Database loading automatically upgrades V1 to V2
- ✅ All frontend components support V2 format
- ✅ Export functionality fully migrated with `filterToMcQuestions` utility
- ✅ Type checking and linting pass
- ✅ Unit tests pass (including the fixed `lessonPlanCompleted` test)
- ✅ Code properly formatted with Prettier

The only remaining work is production validation to ensure:

1. Structured outputs work correctly with V2 schemas
2. Existing lesson plans load and upgrade correctly
3. New lesson plan creation generates V2 quizzes properly

**Note on exports limitation**: The exports package maintains separate schema definitions to support all question types, but currently filters to only multiple-choice questions using the `filterToMcQuestions` utility. This allows for future enhancement when export templates can support other question types.

**Note on checkForUnderstanding**: The `checkForUnderstanding` questions within learning cycles are **NOT** part of this migration and remain in V1 format. These are simpler quiz-like questions embedded within cycles and would require a separate migration effort if needed in the future.

## Current Work in Progress

### 🚧 1. Quiz V2 UI Components - AWAITING REVIEW

**What**: Rendering components for new quiz types (short-answer, match, order)

**Status**: Draft PRs created

- PR #740: ShortAnswerQuestion component
- PR #741: MatchQuestion component
- PR #742: OrderQuestion component

**Next Actions**:

1. Move PRs from draft to ready
2. Request code reviews
3. Address feedback and merge

**What**: Integration with PR #724 to pull diverse question types from Oak's content

**Status**: Planning phased extraction from large PR

**Proposed Phases**:

- Phase 1: Extract core quiz generators and ensure V2 output
- Phase 2: Port quiz ranking/selection logic
- Phase 3: Full pipeline integration

**Why Important**: This will enable generation of all question types (not just multiple-choice)

## Next Steps

### 🔴 Blockers

1. **Export Templates** - PDF/slides only support multiple-choice
   - Need design for how to represent other question types in exports
   - Currently filtering out non-MC questions with `filterToMcQuestions`

### 🟡 Priority Tasks

1. **UI Component Review** (PRs #740, #741, #742)

   - Move from draft → ready
   - Get reviews and merge

2. **Production Validation**

   - Test V2 generation in development
   - Verify V1→V2 upgrade works
   - Monitor for any issues

3. **RAG Integration Planning**
   - Review PR #724 with team
   - Decide on extraction approach
   - Create implementation plan

### 🟢 Future Enhancements

1. **Export Support** - Enable all question types in PDF/slides
2. **Interactive Components** - Add student practice mode
3. **Accessibility** - Improve keyboard navigation and ARIA labels
4. **checkForUnderstanding Migration** - Use V2 components for consistency

### 📝 Additional Notes

**Additional Materials Integration** - The `packages/additional-materials/src/documents/additionalMaterials/promptHelpers.ts` file contains a `renderQuiz` function that converts quiz data to markdown for additional materials generation. Currently it only handles multiple-choice questions (lines 44-64). As new quiz types are added and supported by the UI components, this function will need to be updated to render short-answer, match, and order question types appropriately.
