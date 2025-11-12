# Data Reshaping Audit: Elasticsearch ↔ Cohere ↔ Questions

## ⚠️ TODO: Review Error Handling Strategy

**Priority:** High
**Location:** Entire quiz folder, especially services with validation
**Date Added:** 2025-11-12

### Current Problem

Error handling currently swallows all validation/parsing errors and returns `null`, silently filtering out failed items. This is problematic because:

- **Code issues** (schema bugs, API changes) appear as empty results instead of failing fast
- **Data issues** (1 malformed row in ES) are treated the same as systemic failures
- No visibility into what's failing or why in production

### Proposed Strategy

**Distinguish between code issues and data issues:**

1. **All items fail** → Code is broken → Throw error

   - Schema mismatch across entire dataset
   - API contract violation
   - Should surface immediately, block execution

2. **Some items fail (< threshold)** → Data is corrupt → Report but continue

   - Individual malformed records in Elasticsearch
   - Can be recovered from by using remaining valid data
   - Report to Sentry for monitoring/alerting
   - Log with context (question UID, error details)

3. **Threshold approach**: Allow X% or N items to fail before throwing
   - Example: If >50% of batch fails, it's probably a code issue
   - Example: If <5 questions fail out of 100, it's likely data issues

### Implementation Ideas

- Add failure tracking to parsing loops
- Check failure rate at end of batch
- Report individual failures to Sentry with context
- Only throw if failure rate exceeds threshold
- Add structured logging with question UIDs for debugging

### Files to Review

- `QuizQuestionRetrievalService.ts` - Currently swallows all parsing errors (line 114-130)
- `BaseQuizGenerator.ts` - Error handling in question array methods
- `CohereReranker.ts` - Error handling in reranking (line 60-63)
- Any service with `try/catch` returning `null`

**Owner:** TBD
**Target:** Before next major quiz pipeline changes

---

## Current Data Flow (ML Quiz Generators)

```
Elasticsearch                     Cohere                    Final Questions
───────────────────               ──────────────────        ───────────────────
CustomSource                      SimplifiedResult          QuizQuestionWithRawJson
{ text, questionUid,    →         { text,           →       { question, answers,
  lessonSlug,                       custom_id }               distractors, rawQuiz,
  quizPatchType,                                              id, ... }
  isLegacy,
  embedding }
```

### Step-by-Step Transformations

1. **Elasticsearch Search** (`ElasticsearchQuizSearchService.searchWithHybrid`)

   - Returns: `SearchHit<CustomSource>[]`
   - Contains: Full ES document with `text`, `questionUid`, `embedding`, etc.

2. **Transform for Cohere** (`ElasticsearchQuizSearchService.transformHits`)

   ```typescript
   // packages/aila/src/core/quiz/services/ElasticsearchQuizSearchService.ts:148
   public transformHits(hits: SearchHit<CustomSource>[]): SimplifiedResult[] {
     return hits.map((hit) => ({
       text: hit._source.text,
       custom_id: hit._source.questionUid  // ← Rename questionUid → custom_id
     }));
   }
   ```

3. **Send to Cohere** (`CohereReranker.rerankDocuments`)

   ```typescript
   // packages/aila/src/core/quiz/services/CohereReranker.ts:33
   const cohereDocuments = docs.map((doc) => ({
     text: doc.text,
     custom_id: doc.custom_id, // ← Already SimplifiedResult, no reshape needed!
   }));
   ```

   **PROBLEM**: This is a redundant identity mapping! `SimplifiedResult` already has exactly the shape Cohere wants.

4. **Extract UIDs from Cohere Results** (`CohereReranker.extractCustomId`)

   ```typescript
   // packages/aila/src/core/quiz/services/CohereReranker.ts:58
   public extractCustomId(doc: RerankResponseResultsItem): string {
     const document = doc.document as unknown as SimplifiedResult;  // ← Type casting
     return document.custom_id;
   }
   ```

   **PROBLEM**:

   - Unsafe type cast `as unknown as`
   - Complex validation logic for a simple field access
   - Could just be `doc.document.custom_id` if types were correct

5. **Retrieve Full Questions** (`QuizQuestionRetrievalService.retrieveQuestionsByIds`)
   - Input: `string[]` (UIDs)
   - Output: `QuizQuestionWithRawJson[]`
   - Different Elasticsearch index: `quiz-questions-text-only-2025-04-16`
   - Different source schema: `QuizQuestionTextOnlySource`

---

## Issues Identified

### 1. **Unnecessary Interface: `SimplifiedResult`**

**Current State:**

```typescript
// interfaces.ts
export interface SimplifiedResult {
  text: string;
  custom_id: string;
}

export interface SimplifiedResultQuestion {
  // ← Unused!
  text: string;
  questionUid: string;
}
```

**Why it exists:**

- Created to reshape `CustomSource` → Cohere format
- Uses `custom_id` instead of `questionUid` to match Cohere's API

**Problems:**

- The map in `rerankDocuments` (line 33) is redundant - it creates identical objects
- `SimplifiedResultQuestion` exists but is never used
- Type casting `as unknown as SimplifiedResult` in `extractCustomId` is unsafe

**Fix:**
Cohere's `RerankRequestDocumentsItem` type already accepts `{ text: string, custom_id?: string }`. We can:

- Pass `SimplifiedResult[]` directly without the identity map
- OR eliminate `SimplifiedResult` entirely and just pass objects inline

### 2. **Field Name Inconsistency: `questionUid` vs `custom_id`**

**Throughout the codebase:**

- Elasticsearch indices use: `questionUid`
- `CustomSource` uses: `questionUid`
- `QuizQuestionTextOnlySource` uses: `metadata.questionUid`
- `SimplifiedResult` uses: `custom_id` (to match Cohere)
- `QuizQuestionWithRawJson` uses: `id` (inherits from `QuizV1Question`)

**Impact:**

- Constant reshaping between `questionUid` and `custom_id`
- Transform step exists purely for this rename
- Confusing when reading code

### 3. **Redundant Mapping in `CohereReranker.rerankDocuments`**

```typescript
// Current (lines 33-36):
const cohereDocuments = docs.map((doc) => ({
  text: doc.text,
  custom_id: doc.custom_id,
}));
```

This creates brand new objects identical to the input. **Completely unnecessary!**

Cohere's API accepts the `SimplifiedResult` structure directly.

### 4. **Unsafe Type Casting in `extractCustomId`**

```typescript
// Current (line 59):
const document = doc.document as unknown as SimplifiedResult;
```

This double cast defeats TypeScript's safety. Happens because Cohere's types don't know we're passing custom_id.

**Root cause:** Cohere's generic types don't preserve the custom_id field properly.

### 5. **Two Different Elasticsearch Schemas**

**Vector search index** (`oak-vector-2025-04-16`):

```typescript
interface CustomSource {
  text: string;
  questionUid: string;
  lessonSlug: string;
  quizPatchType: string;
  isLegacy: boolean;
  embedding: number[];
}
```

**Text-only index** (`quiz-questions-text-only-2025-04-16`):

```typescript
interface QuizQuestionTextOnlySource {
  text: string;
  metadata: {
    questionUid: string;
    lessonSlug: string;
    raw_json: string;
  };
}
```

**Why two schemas?**

- Vector index: For semantic search (has embeddings)
- Text-only index: For retrieving full question JSON (has `raw_json`)

**Problem:**

- `questionUid` is in different locations (`root` vs `metadata.questionUid`)
- Both use Elasticsearch `terms` query, but different shapes
- Duplication in BaseQuizGenerator and QuizQuestionRetrievalService (now fixed)

---

## Cleanup Recommendations

### Priority 1: Remove Redundant Mapping

**File:** `packages/aila/src/core/quiz/services/CohereReranker.ts`

**Current:**

```typescript
const cohereDocuments = docs.map((doc) => ({
  text: doc.text,
  custom_id: doc.custom_id,
}));

const response = await this.cohere.rerank({
  documents: cohereDocuments,
  // ...
});
```

**Fix:**

```typescript
const response = await this.cohere.rerank({
  documents: docs, // ← Pass directly, no mapping needed
  // ...
});
```

**Impact:**

- Removes ~50-100 object allocations per rerank (depending on pool size)
- Clearer code - no identity transformation
- Saves 4 lines

### Priority 2: Simplify `extractCustomId`

**Current:**

```typescript
public extractCustomId(doc: RerankResponseResultsItem): string {
  const document = doc.document as unknown as SimplifiedResult;

  if (!document || typeof document !== "object") {
    log.error("Document is not an object:", doc);
    throw new Error("Document is not an object");
  }

  if (!document.custom_id || typeof document.custom_id !== "string") {
    log.error("custom_id not found or invalid in document:", document);
    throw new Error("custom_id not found in document");
  }

  return document.custom_id;
}
```

**Fix (if Cohere types don't expose custom_id properly):**

```typescript
public extractCustomId(doc: RerankResponseResultsItem): string {
  const customId = (doc.document as any)?.custom_id;

  if (typeof customId !== 'string') {
    log.error("custom_id not found in reranked document:", doc);
    throw new Error("custom_id not found in document");
  }

  return customId;
}
```

**Impact:**

- Fewer type casts
- Less verbose validation
- Same runtime safety

### Priority 3: Consider Eliminating `SimplifiedResult` Interface

**Current purpose:**

- Intermediate type between Elasticsearch and Cohere
- Renames `questionUid` → `custom_id`

**Option A: Keep it (low effort)**

- Document why it exists (naming compatibility with Cohere)
- Remove unused `SimplifiedResultQuestion`
- Keep the `transformHits` method as-is

**Option B: Inline it (medium effort)**
Replace `SimplifiedResult` with inline object types:

```typescript
transformHits(hits: SearchHit<CustomSource>[]): Array<{ text: string; custom_id: string }> {
  // ...
}
```

**Option C: Use Cohere's types directly (higher effort)**
Import and use `RerankRequestDocumentsItem` instead of our own interface.

**Recommendation:** **Option A** - Keep `SimplifiedResult` but document it clearly. The naming translation (`questionUid` → `custom_id`) has value for API compatibility.

### Priority 4: Remove Unused Interface

**File:** `packages/aila/src/core/quiz/interfaces.ts`

**Action:** Delete `SimplifiedResultQuestion` - it's never used anywhere in the codebase.

```typescript
// DELETE THIS:
export interface SimplifiedResultQuestion {
  text: string;
  questionUid: string;
}
```

---

## Summary

### Quick Wins (Low Effort, High Value)

1. ✅ Remove identity mapping in `CohereReranker.rerankDocuments` (4 lines saved, clearer)
2. ✅ Simplify `extractCustomId` method (less verbose, same safety)
3. ✅ Delete unused `SimplifiedResultQuestion` interface

### Documentation Improvements

4. ✅ Add comment to `SimplifiedResult` explaining the `questionUid` → `custom_id` rename
5. ✅ Add comment to `transformHits` explaining it prepares data for Cohere

### Bigger Refactors (Lower Priority)

6. ⏸️ Consolidate Elasticsearch query logic (already improved with `QuizQuestionRetrievalService`)
7. ⏸️ Consider unified schema across both ES indices (requires data migration)

### Current Data Flow After Fixes

```
Elasticsearch            Transform           Cohere              Extract UIDs         Retrieve Full
───────────────          ─────────────       ──────────          ────────────────     ──────────────
CustomSource[]      →    SimplifiedResult[]  → Rerank    →       string[]         →   QuizQuestionWithRawJson[]
(ES vector index)        (questionUid→       (no reshape)        (extract           (ES text index)
                         custom_id)                               custom_id)
```

**Key insight:** The only necessary transformation is `questionUid` → `custom_id` in step 1. Everything after that should be pass-through or simple field extraction.
