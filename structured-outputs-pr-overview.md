# Structured Outputs Refactor - PR Overview

## Background

When we first adopted OpenAI structured outputs, it didn't support length constraints on arrays and strings. We worked around this by:

- Creating duplicate schemas (regular and "WithoutLength" versions)
- Using `minMaxText()` helper to add constraints in descriptions
- Having separate `schemaForLLM` and `schemaStrict` properties on agents

Now that OpenAI supports these constraints natively, we've refactored to use them.

## What We've Done

### 1. Added Native Length Constraints

Updated all schemas to use Zod's native constraint methods:

- String constraints: `.max(n)` for character limits
- Array constraints: `.min(n)`, `.max(n)`, `.length(n)` for item counts
- Examples:
  - `MisconceptionSchema`: `.max(200)` for misconception, `.max(250)` for description
  - `KeywordSchema`: `.max(30)` for keyword, `.max(200)` for definition
  - `QuizV1QuestionSchema`: `.length(1)` for answers, `.length(2)` for distractors
  - `ExplanationSchema`: `.min(1).max(5)` for spokenExplanation array

### 2. Removed Redundant Code

- Deleted `schemaHelpers.ts` (containing `minMaxText` function)
- Removed all `StrictMax` schema aliases
- Removed most `WithoutLength` schema variants
- Updated `singleLessonDryRun.ts` to use regular schemas

### 3. Simplified Agent Architecture

- Removed `schemaForLLM`/`schemaStrict` distinction
- All agents now use a single `schema` property
- Simplified `PromptAgentDefinition` type
- Updated `promptAgentHandler` to use single schema

## Current State & Decisions Needed

### 1. Exact Count Constraints

We found prompts specify exact counts but schemas use ranges:

- **Quiz**: Prompts say "6 questions" but schema has `.min(1).max(6)`
- **Checks for Understanding**: Prompts say "2 questions" but schema has `.min(2)`

**Decision**: Keep as ranges for backward compatibility with legacy data.

### 2. Optional Schemas & WithoutLength Variants

Optional schemas are used for parsing partial/incomplete data (e.g., in patches, markdown conversion).

**Issue**: Some optional schemas use the constrained versions:

- `CheckForUnderstandingOptionalSchema` uses `CheckForUnderstandingSchema.partial()` which has `.length(1)` and `.min(2)` constraints
- This could break when parsing partial data

**Options**:

1. Keep `WithoutLength` variants for schemas used in optional schemas
2. Update optional schemas to remove problematic constraints
3. Accept that partial data might fail validation

### 3. Remaining WithoutLength Schemas

Still have these `WithoutLength` schemas:

- `CheckForUnderstandingSchemaWithoutLength`
- `CycleSchemaWithoutLength` (used by `CycleOptionalSchema`)
- `KeywordsSchemaWithoutLength`
- `CompletedLessonPlanSchemaWithoutLength`

**Question**: Should we keep these for backward compatibility and partial data parsing?

### 4. Word Count vs Character Count

Some prompts specify word counts but Zod only supports character counts:

- Learning outcomes: "max 30 words" vs `.max(190)` characters
- Prior knowledge: "max 30 words per statement" (no validation)

**Current approach**: Rely on LLM to follow word count in prompts.

## Testing Considerations

- Need to test with `NEXT_PUBLIC_STRUCTURED_OUTPUTS_ENABLED=true`
- Verify backward compatibility with existing lesson plans
- Test partial data scenarios (patches, incomplete plans)

## Next Steps

1. Decide on optional schema strategy
2. Clean up or keep remaining WithoutLength schemas
3. Run comprehensive tests with structured outputs enabled
4. Consider adding word count validation if needed
