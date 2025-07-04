# Quiz V2 Exports Package Deep Dive

## Overview

This document provides a detailed analysis of TypeScript issues in the exports package related to the Quiz V2 migration. The exports package is responsible for generating PDFs, documents, and slides from lesson plans.

## Current Status

The exports package has been updated to handle Quiz V2 format. Initial type checking shows no errors in the package itself.

## TypeScript Error Analysis

### Local Package Type Check

Running `pnpm type-check` in the exports package passes without errors. This suggests the issue might be:

1. In how the exports package is imported by other packages
2. In the build process when compiling the entire monorepo
3. Related to type exports/imports between packages

### Files Successfully Updated

1. `packages/exports/src/schema/input.schema.ts` - Schema definitions updated to V2
2. `packages/exports/src/helpers/prepQuizForDocs.ts` - Updated to handle V2 structure
3. `packages/exports/src/helpers/prepLessonForSlides.ts` - Updated to handle V2 structure
4. `packages/exports/src/helpers/prepLessonPlanForDocs.ts` - Updated to handle V2 structure

## Investigation Results

### 1. Schema Alignment

- ✅ The exports package defines its own `quizV2Schema` that matches the expected format
- ✅ The schema includes `version: "v2"` and `questions` array
- ✅ Question schema includes `questionType: "multiple-choice"`

### 2. Helper Functions

- ✅ All helper functions updated to access `quiz.questions[index]` instead of `quiz[index]`
- ✅ Functions handle the V2 structure correctly
- ✅ Type annotations use the local Quiz type from input.schema.ts

### 3. Potential Issues

- The TypeScript error might be occurring when other packages import from exports
- Need to check if the exports are properly configured in package.json
- May need to verify tsconfig.json settings

## Actual TypeScript Errors Found

### 1. API Package Error (appSessions.ts)

```
Argument of type '{ version: "v2"; questions: [...] }' is not assignable to parameter of type '{ answers: string[]; question: string; distractors: string[]; }[]'
```

**Root Cause**: The `convertQuizV1ToV2` function is being called with a V2 quiz that's already been converted. The function expects V1 format (array) but is receiving V2 format (object with version and questions).

**Solution**: Need to check if the quiz is already V2 before calling the conversion function.

### 2. NextJS Build Error (useDownloadView.ts)

```
Type '"short-answer"' is not assignable to type '"multiple-choice"'
```

**Root Cause**: The exports package is expecting only multiple-choice questions, but the schema from aila includes other question types (short-answer, match, order).

**Solution**: The exports package should either:

- Accept the full V2 schema with all question types
- Have a separate type for multiple-choice only exports

## Fixes Required

### Fix 1: appSessions.ts ✅ FIXED

The conversion logic was trying to convert already-converted V2 quizzes. Fixed by:

1. Adding type guard functions `isQuizV1` and `isQuizV2` to the conversion module
2. Using `isQuizV1` instead of `detectQuizVersion` to get proper type narrowing
3. This allows TypeScript to know the quiz is definitely V1 format when passed to `convertQuizV1ToV2`

### Fix 2: Export Types ✅ FIXED

The exports package schema has been updated to accept all V2 question types:

1. Added support for multiple-choice, short-answer, match, and order question types
2. Maintained separation between LLM generation schema (strict) and import schema (flexible)
3. This allows exports to accept any quiz format from the frontend while LLM continues to generate only multiple-choice

---

_This document is referenced from quiz-v2-migration-plan.md_
