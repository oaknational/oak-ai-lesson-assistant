# Quiz V2 Conversion Report - Detailed Analysis

## Overview

This report analyzes the actual changes in the diff between commit `300e9124c636f97e0928bfc6ff2472051d22431b` and the main branch, focusing on the quiz V1 to V2 conversion implementation.

## Core Implementation: Raw Quiz to V2 Conversion

### The `convertRawQuizToV2` Function

The key innovation in this work is the `convertRawQuizToV2` function in `packages/aila/src/protocol/schemas/quiz/conversion/rawQuizIngest.ts`. This function:

1. **Validates input** using Oak's curriculum schema
2. **Filters out** explanatory-text question types
3. **Extracts markdown** from complex content structures
4. **Handles image attributions** from metadata

### Markdown Extraction with Image Support

The `extractMarkdownFromContent` function is crucial for converting Oak's structured content to markdown:

```typescript
function extractMarkdownFromContent(
  contentItems: Array<TextItem | ImageItem | undefined>,
): {
  markdown: string;
  attributions: Array<{ imageUrl: string; attribution: string }>;
};
```

**Key features:**

- Converts text items directly to strings
- Converts image items to markdown image syntax: `![](imageUrl)`
- Extracts attribution metadata from image objects
- Joins all content parts with spaces

**Image handling:**

- Images are inlined in markdown as `![](secure_url)`
- Attribution metadata is extracted from `image_object.metadata.attribution`
- All attributions are collected and attached to the question

## Schema Evolution Details

### V1 Schema (Legacy)

- Simple array of questions
- Only supports multiple-choice
- Fields: `question`, `answers[]`, `distractors[]`

### V2 Schema (New)

```typescript
{
  version: "v2",
  questions: QuizV2Question[]
}
```

### Image Attribution Schema

```typescript
{
  imageUrl: string,
  attribution: string
}
```

Each question can have multiple image attributions stored in the `imageAttributions` field.

## Raw Quiz Format Conversion

### Input: Oak Curriculum Format

The raw quiz format from Oak curriculum includes:

- Complex content structures with text and image items
- Nested answer formats for different question types
- Metadata including attribution information

### Conversion Process

1. **Multiple Choice Questions:**

   - Filters answers by `answer_is_correct` flag
   - Correct answers → `answers` array
   - Incorrect answers → `distractors` array
   - Collects attributions from all content

2. **Short Answer Questions:**

   - Maps all answers to acceptable answers array
   - Preserves markdown formatting

3. **Match Questions:**

   - Converts match arrays to pairs of left/right items
   - Each item converted to markdown

4. **Order Questions:**
   - Converts order items to markdown array
   - Preserves sequence

## Component Changes

### LessonOverviewQuizContainer Refactoring

**Before:**

```typescript
{
  questions: RawQuiz,
  imageAttribution: { attribution: string; questionNumber: string }[],
  isMathJaxLesson: boolean
}
```

**After:**

```typescript
{
  quiz: QuizV2,
  isMathJaxLesson: boolean
}
```

The component now:

- Accepts V2 quiz format directly
- Extracts image attributions from quiz data using `useMemo`
- Maps attributions to question numbers (Q1, Q2, etc.)
- Displays attributions at the bottom of the quiz

## File Structure Changes

### Removed Files

- Multiple component files from `AppComponents/Chat/Quiz/`:
  - QuizImage components
  - QuizImageAnswer components
  - QuizOakImage components
  - Various question type components

### New Organization

```
packages/aila/src/protocol/schemas/quiz/
├── index.ts                    # Main exports
├── quizV1.ts                  # Legacy V1 schema
├── quizV2.ts                  # New V2 schema with image attribution
├── rawQuiz.ts                 # Raw quiz type (moved from protocol root)
└── conversion/
    ├── quizV1ToV2.ts         # V1 to V2 conversion
    └── rawQuizIngest.ts      # Raw to V2 conversion with markdown
```

## Key Technical Details

### Markdown Generation

- Text content is joined with spaces
- Images are converted to `![](url)` format
- All content types are flattened into single markdown strings

### Attribution Tracking

- Extracted from `image_object.metadata.attribution`
- Stored with image URL for reference
- Aggregated across all question content (stem, answers, distractors)

### Type Safety

- Uses discriminated unions for question types
- Validates input with Zod schemas
- Provides type guards for version detection

## Benefits of This Implementation

1. **Rich Content Support**: Images and text seamlessly combined in markdown
2. **Attribution Preservation**: Image credits maintained throughout conversion
3. **Flexible Format**: Markdown allows easy rendering and editing
4. **Backward Compatibility**: V1 quizzes convert to multiple-choice V2
5. **Type Safety**: Strong typing throughout the conversion pipeline

## Example Conversion

**Raw Quiz Input:**

```typescript
{
  questionStem: [
    { text: "What is", type: "text" },
    {
      image_object: {
        secure_url: "https://...",
        metadata: { attribution: "Image © Oak National" },
      },
      type: "image",
    },
  ];
}
```

**V2 Output:**

```typescript
{
  question: "What is ![](https://...)",
  imageAttributions: [
    { imageUrl: "https://...", attribution: "Image © Oak National" }
  ]
}
```

## Summary

This conversion work successfully transforms Oak's complex curriculum quiz format into a cleaner V2 structure that:

- Supports multiple question types via discriminated unions
- Preserves rich content through markdown conversion
- Maintains image attribution metadata
- Provides a clear upgrade path from V1 format
- Simplifies component implementation by consolidating data handling
