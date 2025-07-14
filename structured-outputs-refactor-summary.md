# Structured Outputs Refactor Summary

## What We've Done

### 1. Investigated OpenAI Structured Outputs Support

- Confirmed that OpenAI structured outputs now DO support length constraints:
  - `minLength`, `maxLength` for strings
  - `minItems`, `maxItems` for arrays
- The workaround of using separate schemas and descriptions is no longer necessary

### 2. Updated Schemas to Use Native Length Constraints

Since OpenAI now supports these constraints, we updated all schemas to use native Zod methods:

#### Updated Schemas:

- **QuizV1Schema**: Added `.length(1)` for answers, `.length(2)` for distractors, `.min(1).max(6)` for quiz array
- **QuizV2Schema**: Added `.length(1)` for answers, `.length(2)` for distractors in multiple-choice
- **MisconceptionSchema**: Added `.max(200)` for misconception, `.max(250)` for description, `.min(1).max(3)` for array
- **KeywordSchema**: Added `.max(30)` for keyword, `.max(200)` for definition, `.min(1).max(5)` for array
- **CycleSchema**: Added `.min(2)` for checkForUnderstanding array
- **CheckForUnderstandingSchema**: Added `.length(1)` for answers, `.min(2)` for distractors
- **LearningOutcomeSchema**: Added `.max(190)`
- **LessonTitleSchema**: Added `.max(80)`
- **LearningCyclesSchema**: Added `.min(1).max(3)`
- **PriorKnowledgeSchema**: Added `.min(1).max(5)`
- **KeyLearningPointsSchema**: Added `.min(3).max(5)`

### 3. Removed Redundant Code

- **Deleted `schemaHelpers.ts`**: Removed the `minMaxText` helper function as it's no longer needed
- **Removed StrictMax aliases**: All StrictMax schema variants were just aliases after adding constraints
- **Removed WithoutLength variants**:
  - `MisconceptionsSchemaWithoutLength`
  - `KeywordsSchemaWithoutLength`
  - `CheckForUnderstandingSchemaWithoutLength`
  - `CycleSchemaWithoutLength`

### 4. Simplified Agent Architecture

- **Removed schemaForLLM/schemaStrict distinction**: All agents now use a single `schema` property
- **Updated PromptAgentDefinition**: Simplified from `<SchemaForLLM, SchemaStrict>` to just `<Schema>`
- **Updated promptAgentHandler**: Now uses single schema for both generation and validation

## Constraints Found in Prompts but Not Enforced in Schemas

### 1. Word Count Constraints (Not Enforceable with Zod)

- **Learning Outcome**: Prompt says max 30 words, schema has max 190 characters
- **Learning Cycle Outcomes**: Prompt says max 20 words each, no validation
- **Prior Knowledge**: Prompt says max 30 words per statement, no validation

### 2. Missing Exact Count Constraints

- **Quiz Questions**: Should be exactly `.length(6)` not `.min(1).max(6)`
  - Prompts clearly state "Create a 6-question multiple-choice quiz"
- **Checks for Understanding**: Should be exactly `.length(2)` not `.min(2)`
  - Prompt says "choose the two highest leverage questions"

### 3. Missing Length Constraints

- **Learning Cycle Title**: Missing `.max(50)` characters constraint
- **Explanation spokenExplanation**: When array, should have `.min(1).max(5)`
  - Prompt says "1-5 points that outline what the teacher should explain"

### 4. Already Properly Enforced

- ✓ Misconception character limits (200/250)
- ✓ Keyword definition length (200)
- ✓ Quiz answer/distractor counts (1/2)
- ✓ Most array size constraints

## What We Should Do Next

### 1. Fix the Exact Count Constraints

```typescript
// Update QuizV1Schema
export const QuizV1Schema = z.array(QuizV1QuestionSchema).length(6);

// Update checkForUnderstanding in CycleSchema
checkForUnderstanding: z.array(CheckForUnderstandingSchema).length(2);
```

### 2. Add Missing Character Constraints

```typescript
// Update cycle title in CycleSchema
title: z.string().max(50).describe(CYCLE_DESCRIPTIONS.title);

// Update ExplanationSchema for spokenExplanation
spokenExplanation: z.union([z.string(), z.array(z.string()).min(1).max(5)]);
```

### 3. Consider Word Count Validation

Since Zod doesn't support word count validation natively, options are:

- Add custom refinements with word counting logic
- Keep relying on LLM to follow prompt instructions
- Document the limitation

### 4. Clean Up Remaining WithoutLength Schemas

Check if `KeywordsSchemaWithoutLength`, `CheckForUnderstandingSchemaWithoutLength`, and `CycleSchemaWithoutLength` are still used anywhere and remove them if not.

### 5. Test with Structured Outputs Enabled

Run the application with `NEXT_PUBLIC_STRUCTURED_OUTPUTS_ENABLED=true` to ensure everything works correctly with the new schemas.
