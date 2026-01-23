# Lesson Adapt Database Schema Plan

## Overview

This document outlines the Prisma schema design for storing lesson adaptations. The design supports:
- Users making multiple adaptations of the same lesson
- Versioning of adapted content (each edit creates a new version)
- Storing both lesson metadata and Google Slides presentation references

---

## Proposed Tables

### 1. `LessonAdaptSession`

Represents a user's adaptation session for a specific OWA lesson. A user can have multiple sessions for the same lesson (e.g., adapting for different classes or purposes).

```prisma
model LessonAdaptSession {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  userId String @map("user_id")

  // Reference to the original OWA lesson
  owaLessonSlug String @map("owa_lesson_slug")
  owaLessonId   Int?   @map("owa_lesson_id") // Oak's internal lesson ID if available

  // Optional display name for this adaptation (e.g., "Year 8 Set 2 - Fractions")
  displayName String? @map("display_name")

  // The user's copied Google Slides presentation
  presentationId  String @map("presentation_id")
  presentationUrl String @map("presentation_url")

  // Session status
  status LessonAdaptSessionStatus @default(ACTIVE)

  // Versions of the adapted lesson content
  versions LessonAdaptVersion[]

  @@index([userId, owaLessonSlug])
  @@map("lesson_adapt_sessions")
  @@schema("public")
}

enum LessonAdaptSessionStatus {
  ACTIVE    // User is actively working on this adaptation
  ARCHIVED  // User has archived/completed this adaptation
  DELETED   // Soft deleted

  @@schema("public")
}
```

### 2. `LessonAdaptVersion`

Stores each version of the adapted lesson content. A new version is created each time the user applies changes to the slides or lesson data.

```prisma
model LessonAdaptVersion {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now()) @map("created_at")

  sessionId String             @map("session_id")
  session   LessonAdaptSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  // Version number (1, 2, 3, etc.) - auto-incremented per session
  versionNumber Int @map("version_number")

  // Snapshot of the extracted lesson data at this version
  // Matches ExtractedLessonData schema from extractLessonData.ts
  lessonData Json @map("lesson_data") @db.JsonB

  // Optional: Snapshot of raw slide content for LLM context
  slideContent Json? @map("slide_content") @db.JsonB

  // What changes were applied to create this version
  changes LessonAdaptChange[]

  // Hash of lessonData for deduplication
  hash String

  @@unique([sessionId, versionNumber])
  @@index([sessionId])
  @@map("lesson_adapt_versions")
  @@schema("public")
}
```

### 3. `LessonAdaptChange` (Optional - for audit trail)

Tracks individual changes made in each adaptation. Useful for understanding what modifications users commonly make and for potential "undo" functionality.

```prisma
model LessonAdaptChange {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now()) @map("created_at")

  versionId String             @map("version_id")
  version   LessonAdaptVersion @relation(fields: [versionId], references: [id], onDelete: Cascade)

  // Type of change
  changeType LessonAdaptChangeType @map("change_type")

  // What was changed (e.g., "slide:3", "keyLearningPoints[0]", "learningOutcome")
  targetPath String @map("target_path")

  // The user's original prompt/instruction that led to this change
  userPrompt String? @map("user_prompt")

  // Description of the change (from the AI plan)
  description String?

  // Before/after values (for audit/undo)
  previousValue Json? @map("previous_value") @db.JsonB
  newValue      Json? @map("new_value") @db.JsonB

  @@index([versionId])
  @@map("lesson_adapt_changes")
  @@schema("public")
}

enum LessonAdaptChangeType {
  TEXT_EDIT           // Changed text content
  SLIDE_DELETE        // Removed a slide
  SLIDE_REORDER       // Reordered slides
  SLIDE_ADD           // Added a new slide
  ELEMENT_DELETE      // Removed an element from a slide
  ELEMENT_ADD         // Added an element to a slide
  KLP_EDIT            // Changed key learning points
  KEYWORD_EDIT        // Changed keywords
  MISCONCEPTION_EDIT  // Changed misconceptions
  OUTCOME_EDIT        // Changed learning outcome
  OTHER               // Catch-all for other changes

  @@schema("public")
}
```

---

## Schema Diagram

```
┌─────────────────────────────┐
│    LessonAdaptSession       │
├─────────────────────────────┤
│ id                          │
│ userId                      │
│ owaLessonSlug               │
│ owaLessonId                 │
│ displayName                 │
│ presentationId              │
│ presentationUrl             │
│ status                      │
│ createdAt / updatedAt       │
└──────────────┬──────────────┘
               │ 1:N
               ▼
┌─────────────────────────────┐
│    LessonAdaptVersion       │
├─────────────────────────────┤
│ id                          │
│ sessionId (FK)              │
│ versionNumber               │
│ lessonData (JSON)           │
│ slideContent (JSON)         │
│ hash                        │
│ createdAt                   │
└──────────────┬──────────────┘
               │ 1:N
               ▼
┌─────────────────────────────┐
│    LessonAdaptChange        │
│    (optional audit trail)   │
├─────────────────────────────┤
│ id                          │
│ versionId (FK)              │
│ changeType                  │
│ targetPath                  │
│ userPrompt                  │
│ description                 │
│ previousValue / newValue    │
│ createdAt                   │
└─────────────────────────────┘
```

---

## Data Flow

### 1. Starting a New Adaptation

When a user first accesses a lesson to adapt:

1. Check if they have an existing `LessonAdaptSession` for this `owaLessonSlug` with status `ACTIVE`
2. If not, create a new session:
   - Duplicate the slide deck → get `presentationId` and `presentationUrl`
   - Extract lesson data from OWA API
   - Create `LessonAdaptSession`
   - Create initial `LessonAdaptVersion` (version 1) with the original lesson data

### 2. Applying Changes

When the user approves and applies changes:

1. Execute changes via Google Slides API
2. Re-extract the lesson data from the updated presentation (or apply changes to stored data)
3. Create new `LessonAdaptVersion` with `versionNumber = previous + 1`
4. Optionally create `LessonAdaptChange` records for each change applied

### 3. Returning to an Adaptation

When a user returns to a previous adaptation:

1. Query `LessonAdaptSession` by `userId` and `owaLessonSlug` (or session ID)
2. Load the latest `LessonAdaptVersion` to restore state
3. Use the stored `presentationId` to access their adapted slides

---

## `lessonData` JSON Structure

Based on `ExtractedLessonData` from `extractLessonData.ts`:

```typescript
{
  keyStage: string;
  subject: string;
  title: string;
  learningOutcome: string;
  learningCycles: string[];
  keyLearningPoints: string[];
  keywords: Array<{
    keyword: string;
    definition: string;
  }>;
  misconceptions: Array<{
    misconception: string;
    description: string;
  }>;
}
```

---

## Open Questions

1. **Should we store the full raw OWA lesson data?**
   - Pro: Enables re-extraction if schema changes
   - Con: Duplicates data, increases storage

2. **Should `slideContent` be stored in every version?**
   - Pro: Full audit trail of slide changes
   - Con: Large JSON blobs, potentially redundant with Google Slides being the source of truth

3. **Do we need a separate table for chat/conversation history?**
   - The user's prompts and AI responses during adaptation
   - Could link to existing chat infrastructure or be stored separately

4. **How should we handle presentation expiry/cleanup?**
   - Google Drive has storage limits
   - Should we have TTL on inactive sessions?

5. **Should the `User` table have a relation to `LessonAdaptSession`?**
   - Currently using `userId` as string (Clerk ID pattern)
   - Could add formal FK if needed

---

## Migration Considerations

- New tables, no impact on existing data
- Consider adding to `public` schema (consistent with other user-facing tables)
- May want indexes on `userId + owaLessonSlug` for quick lookups

---

## Next Steps

1. Review and finalize schema design
2. Create Prisma migration
3. Update `lessonAdaptRouter` to use database for session management
4. Implement version tracking on change execution
