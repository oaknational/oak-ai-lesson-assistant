# Quiz Types Development - Planning and Progress

## Overview

This project enables support for multiple quiz types (beyond just multiple choice) across three key areas:

1. **Schema Design**: New versioned schema with discriminated union for different quiz types
2. **Frontend Rendering**: Components to display various quiz types properly
3. **Export Integration**: Rendering quiz types in lesson plan documents and slide presentations

## Problem Statement

### Current Issues

- **🚨 Quiz Type Coercion**: All quiz questions forced into multiple choice format (affects Gareth's maths work)
- **🚨 MathJax Rendering**: Always renders on new lines instead of inline
  - **Note**: `\\(x = 5\\)` works inline, `$$ x = 5 $$` forces new line
  - **Fix**: Configure MathJax to move `$$` from `displayMath` to `inlineMath` array
- **⚠️ Limited Quiz Types**: Only multiple choice supported across the system
- **⚠️ Export Limitations**: Exports only handle MC format
- **⚠️ Styling Issues**: Suboptimal quiz component styling

### Dependencies

- **Gareth's Branch**: Has maths quiz work that needs new schema integration (should merge ASAP)
- **Feature Flag**: `agentic-aila-may-25` required for testing

## Three-Part Implementation Strategy

### 1. New Quiz Schema Design

**Goal**: Create versioned schema supporting multiple quiz types

**Current State**:

- Existing data uses schema that coerces everything to multiple choice
- Schema doesn't support discriminated unions for different question types
- Aila megaprompt structured output only supports MC format

**Required Changes**:

- Design discriminated union schema for different quiz types
- Implement schema versioning for backwards compatibility
- Coordinate with Gareth's maths integration needs
- **Dual Schema Architecture**: Broader schema for system, narrower MC schema for Aila

**Schema Architecture Strategy**:

- **Broad Schema**: Full discriminated union supporting all quiz types (storage, frontend, exports)
- **Narrow Schema**: MC-only subset for Aila megaprompt structured output
- **Bridge Logic**: Handle transitions between broad and narrow schemas
- **Rationale**: Allows Aila to continue using MC while system supports all types

**Deliverable**: New schema structure for Gareth's functions to return all quiz types

### 2. Frontend Quiz Rendering

**Goal**: Display all quiz types properly in the UI

**Current State**:

- Quiz components force everything into MC format
- Existing OWA components available but may need simplification

**Required Changes**:

- Implement components for different quiz types using new schema
- Fix MathJax to render inline instead of block
- Apply Anna's designs for improved styling

**Resources Available**:

- **Components**: OWA components at https://labs.thenational.academy/test_quiz_page
- **Designs**: Anna's Figma designs at https://www.figma.com/proto/qzhH9Rw0j682DJmQc4hS5u/Quiz-early-WIP?node-id=5-2792&t=S84xZ2pvqfEy0ZxW-1

### 3. Export Integration

**Goal**: Render new quiz types in exported documents

**Current State**:

- Exports only support MC quiz format
- PDF exports are critical (primary usage method initially)

**Required Changes**:

- Update export generation for lesson plan documents
- Update export generation for Google Slides presentations
- Ensure PDF effectiveness per image specifications

**Export References**:

- [Mitch's exploration video](https://www.loom.com/share/037af5ec1bce4e37974d845d818e8c49?sid=df1a1283-90b7-44d6-a123-90dfff8179e3)
- [GitHub project board](https://github.com/orgs/oaknational/projects/12)
- [Oak Exports API Proposal](https://www.notion.so/oaknationalacademy/Oak-Exports-API-Proposal-1d126cc4e1b180e69a97d3a3a93d545f)

## Technical Specifications

### Image Requirements

**Content Guidelines**:

- Images only for answering questions (no decorative images)
- Black and white printing compatible (no color dependency)
- Highest quality format in Cloudinary
- **Critical**: Effective in PDF exports

**Technical Specs**:

- **All images**: 3:2 landscape ratio
- **Question stems**: 207px height
- **MCQ answers**: 96px height, auto-cropped to 3:2
- **Rationale**: Existing PDFs with images often unusable

### Image/Text Mixing Rules

**Guidance** (not enforced):

- All answer types same within question
- **Valid combinations**: All images | All text | All image+text
- **UI Notes**: CAT handles mixed types poorly, OWA handling unclear

## Schema Architecture

### Complete Schema Flow

The quiz types implementation uses a three-layer schema architecture that bridges Oak's curriculum data through to Aila's LLM generation:

```
Oak Curriculum Schema (External)
        ↓ (snake_case, rich metadata)
📄 rawQuizSchema.ts
        ↓ (convertRawQuizToV2)
🆕 QuizSchemaV2 (discriminated union)
        ↓ (bridge conversion)
📄 QuizSchemaV1 (MC only, legacy)
        ↓ (Aila LLM generation)
🤖 Structured Output Generation
```

### Schema Layers

#### 1. Oak Raw Schema (`rawQuizSchema.ts`)

- **Source**: `@oaknational/oak-curriculum-schema` (external dependency)
- **Format**: snake_case field names, complex nested structure
- **Features**: Rich metadata (questionId, questionUid, imageObjects, etc.)
- **Types**: All 5 quiz types with full Oak curriculum compatibility
- **Usage**: Importing/parsing quiz data from Oak's curriculum system

#### 2. Aila V2 Schema (QuizQuestionSchemaV2)

- **Source**: Custom discriminated union schema in `schema.ts`
- **Format**: camelCase field names, clean discriminated union structure
- **Features**: 5 quiz types, feedback, hints, streamlined for Aila
- **Types**:
  - `multiple-choice`: Traditional format with answers and distractors
  - `short-answer`: Open-ended questions with acceptable answers
  - `match`: Pair-matching questions with left/right items
  - `order`: Sequencing questions with items to arrange
  - `explanatory-text`: Information-only content blocks
- **Usage**: Frontend display, exports, rich quiz functionality

#### 3. Aila V1 Schema (QuizQuestionSchemaV1)

- **Source**: Legacy schema in `schema.ts`
- **Format**: camelCase field names, simple structure
- **Features**: Multiple choice only (question, answers, distractors)
- **Usage**: LLM generation (structured output), backward compatibility

### Bridge Functions

#### Schema Conversion Pipeline

- `convertRawQuizToV2()` - Oak Raw → Aila V2 (preserves all quiz types)
- `convertRawQuizToV1()` - Oak Raw → Aila V1 (converts to MC with data loss)
- `convertQuizV2ToV1()` - Aila V2 → Aila V1 (converts with appropriate fallbacks)
- `convertQuizV1ToV2()` - Aila V1 → Aila V2 (promotes MC to V2 format)

#### Backward Compatibility

- `ensureQuizV1Compatible()` - Any format → V1 (safe conversion)
- `ensureQuizV2Compatible()` - Any format → V2 (safe conversion)
- `detectQuizVersion()` - Automatic version detection
- `getQuizForContext()` - Context-aware format selection

#### Context-Aware Usage

- **LLM Generation**: Always uses V1 (MC only) for reliable structured output
- **Frontend Display**: Prefers V2 (all types) with V1 fallback
- **Export Systems**: Prefers V2 (all types) with V1 fallback
- **Legacy Data**: Automatically handled via bridge functions

### File Locations

- **Quiz Schema Organization**: `packages/aila/src/protocol/schemas/quiz/`
  - `index.ts` - Main export point for all quiz schemas
  - `quizV1.ts` - Legacy quiz schema (multiple choice only)
  - `quizV2.ts` - Modern discriminated union schema (all quiz types)
  - `quizBridge.ts` - Bridge logic for schema conversions
  - `quizBridge.test.ts` - Comprehensive bridge function tests
- **Legacy Files** (still referenced):
  - `packages/aila/src/protocol/schema.ts` - Core Aila schemas
  - `packages/aila/src/protocol/rawQuizSchema.ts` - Raw Oak schema types
  - `packages/aila/src/protocol/jsonPatchProtocol.ts` - JSON patch support

### Lesson Plan Integration

The schemas are integrated into the lesson plan structure:

```typescript
// V1 fields (existing)
starterQuiz?: QuizV1;
exitQuiz?: QuizV1;


// Raw experimental fields (Oak import)
_experimental_starterQuizMathsV1?: RawQuiz;
_experimental_exitQuizMathsV1?: RawQuiz;
```

This allows gradual migration while maintaining full backward compatibility.

## Implementation Plan

### Phase 1: Schema Foundation ✅ COMPLETED

1. **Environment Setup**

   - Enable `agentic-aila-may-25` feature flag (PostHog development)
   - Upload maths lesson plans to RAG schema (`rag.rag_lesson_plans`, `rag.rag_lesson_plan_parts`)

2. **Schema Investigation** ✅

   - ✅ Analyzed current quiz schema structure
   - ✅ Identified coercion points in the codebase (primarily `lessonTransformer.ts`)
   - ✅ Fixed V1 naming issues from bulk replacements
   - Review Gareth's branch and requirements

3. **New Schema Design** ✅

   - ✅ Created discriminated union schema for quiz types (QuizQuestionSchemaV2)
   - ✅ Implemented versioning strategy with V1/V2 schemas
   - ✅ Built comprehensive bridge logic between schema versions
   - ✅ Added backward compatibility utilities
   - ✅ Integrated with JSON patch protocol and LLM schemas
   - ✅ Applied namespace naming convention (QuizV1Question vs QuizQuestionV1)

4. **Schema Organization** ✅
   - ✅ Created dedicated quiz folder structure (`schemas/quiz/`)
   - ✅ Reorganized quiz schema files for better modularity
   - ✅ Updated all import paths throughout codebase
   - ✅ Completed namespace naming refactor for patch schemas (PatchQuizV1)

### Phase 2: Frontend Implementation

1. **Component Analysis**

   - Evaluate existing OWA components (test page)
   - Assess Anna's design requirements
   - Determine component strategy (adapt vs rebuild)

2. **Quiz Type Components**

   - Implement components for each quiz type using new schema
   - Fix MathJax inline rendering
   - Apply design system styling

3. **Integration Testing**
   - Test with maths lessons locally
   - Validate all quiz types render correctly
   - Ensure backwards compatibility

### Phase 3: Export Integration

1. **Export System Analysis**

   - Review current export generation (lesson plans, slides)
   - Identify quiz rendering points in export pipeline
   - Assess PDF generation requirements

2. **Export Updates**

   - Implement quiz type rendering for documents
   - Implement quiz type rendering for presentations
   - Ensure image specifications compliance

3. **End-to-End Testing**
   - Test complete workflow: creation → display → export
   - Validate PDF effectiveness
   - Performance and compatibility testing

## Testing Strategy

### Local Development Setup

1. Feature flag enabled
2. Maths lesson plans in RAG schema
3. Create maths lesson → navigate to quiz section
4. Test all quiz types render correctly

### Validation Points

- Schema backwards compatibility
- Frontend quiz type rendering
- MathJax inline display
- Export document generation
- PDF quality and usability

## Success Criteria

1. **Schema** ✅: Discriminated union supporting multiple quiz types with versioning
   - ✅ V2 discriminated union schema created with 5 quiz types
   - ✅ Bridge logic implemented for V1 ↔ V2 ↔ Raw Oak schema
   - ✅ Backward compatibility maintained for existing V1 data
   - ✅ JSON patch protocol and LLM schema integration complete
   - ✅ Namespace naming convention applied (QuizV1Question, PatchQuizV1)
   - ✅ Schema file organization with dedicated quiz folder structure
2. **Frontend**: All quiz types render properly with improved styling
3. **Exports**: Quiz types work in lesson plan documents and slide presentations
4. **Compatibility** ✅: Existing functionality maintained
   - ✅ V1 quiz data continues to work unchanged
   - ✅ Context-aware format selection (LLM gets V1, display gets V2)
   - ✅ Automatic version detection and safe conversion utilities
5. **Integration**: Seamless handoff to Gareth's maths work
   - ✅ Raw Oak schema integration ready for maths quiz import
   - ✅ Bridge functions handle Oak curriculum → Aila conversion

## Testing Requirements

<!-- Document testing approach for new quiz types -->
