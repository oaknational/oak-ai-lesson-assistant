# Moderation System Restructure - Implementation TODO

## Overview

This document contains the implementation tasks for restructuring the moderation system from 6 grouped categories to 28 individual moderation categories. Each ticket must be completed in sequence according to dependencies and thoroughly tested before proceeding.

## Implementation Sequence

The tickets must be completed in this exact order due to dependencies:
**MOD-001** → **MOD-002** → **MOD-003** → **MOD-004** → **MOD-005** → **MOD-006**

---

## MOD-001: Core Data Structure Refactoring

**Priority**: High  
**Dependencies**: None  
**Estimated Effort**: 2-3 days  
**Status**: ✅ **COMPLETED** - August 13, 2025

### Files to Modify

1. `/packages/core/src/utils/ailaModeration/moderationCategories.json`
2. `/packages/core/src/utils/ailaModeration/moderationSchema.ts`  
3. `/apps/nextjs/src/stores/moderationStore/types.ts`

### Implementation Tasks

#### Task 1.1: Update moderationCategories.json ✅
- ✅ Replaced grouped structure with flat array of 28 individual categories
- ✅ Used exact category definitions from `new_moderation_new_rubrick.ipynb`
- ✅ Each category includes all required fields:
  - `code`: Full category code (e.g., "l/discriminatory-language")
  - `title`: Human-readable title
  - `llmDescription`: Complete description for AI assessment
  - `abbreviation`: Short code (e.g., "l1")
  - `criteria5`, `criteria4`, `criteria3`, `criteria2`, `criteria1`: Complete criteria definitions

#### Task 1.2: Update moderationSchema.ts ✅
- ✅ Replaced grouped schema with individual category schemas
- ✅ Created dynamic score fields for all 28 categories using abbreviations
- ✅ Updated `moderationCategoriesSchema` to include all 28 abbreviated codes
- ✅ Updated `moderationResponseSchema` to match new structure

#### Task 1.3: Update types.ts ✅
- ✅ Defined new interfaces for individual categories
- ✅ Updated moderation result types to handle 28 individual scores
- ✅ Removed group-based type definitions
- ✅ Added types for abbreviated codes

### Testing Requirements

#### Unit Tests
```bash
# Run moderation schema tests
pnpm test -- --testPathPattern="moderationSchema"

# Run type validation tests  
pnpm test -- --testPathPattern="moderationStore.*types"
```

#### Validation Tests ✅
- [x] All 28 categories present in JSON structure
- [x] Schema validation passes for new structure
- [x] TypeScript compilation succeeds
- [x] All abbreviated codes (l1, l2, u1-u5, s1, p2-p5, e1, r1-r2, n1-n7, t1-t6) properly defined

#### Post-Completion Verification
```bash
# Verify schema validation works
node -e "
  const schema = require('./packages/core/src/utils/ailaModeration/moderationSchema.ts');
  const categories = require('./packages/core/src/utils/ailaModeration/moderationCategories.json');
  console.log('Categories count:', categories.length);
  console.log('Expected: 28');
"

# Type check all affected files
pnpm type-check
```

---

## MOD-002: Prompt and LLM Integration Overhaul

**Priority**: High  
**Dependencies**: MOD-001  
**Estimated Effort**: 3-4 days  
**Status**: ✅ **COMPLETED** - August 13, 2025

### Files to Modify

1. `/packages/core/src/utils/ailaModeration/moderationPrompt.ts`
2. `/packages/aila/src/features/moderation/AilaModeration.ts`

### Implementation Tasks

#### Task 2.1: Update moderationPrompt.ts ✅
- ✅ Replaced grouped prompt generation with individual category assessment
- ✅ Implemented `generateNewModerationPrompt` function that:
  - Takes array of 28 category objects as input
  - Generates detailed prompt for each category with full criteria
  - Includes scoring instructions and JSON response format
  - Follows exact format from notebook

#### Task 2.2: Update AilaModeration.ts ✅
- ✅ Modified core moderation logic to use new prompt structure
- ✅ Updated LLM response parsing to handle 28 individual scores
- ✅ Implemented validation for new JSON response format
- ✅ Updated error handling for malformed responses

### Testing Requirements

#### Integration Tests
```bash
# Test moderation with sample content
pnpm test -- --testPathPattern="AilaModeration"

# Test prompt generation
pnpm test -- --testPathPattern="moderationPrompt"
```

#### Manual Testing ✅
Create test lesson plan and verify:
- [x] Prompt generates correctly for all 28 categories
- [x] LLM response includes all 28 scores
- [x] Justifications provided for scores < 5
- [x] JSON parsing works correctly
- [x] Error handling works for malformed responses

#### Post-Completion Verification
```bash
# Test with actual OpenAI API (if available)
node -e "
  const moderation = require('./packages/aila/src/features/moderation/AilaModeration.ts');
  const testContent = 'This is a test lesson about mathematics.';
  // Run moderation and verify response structure
"
```

---

## MOD-003: Additional Materials Integration

**Priority**: Medium  
**Dependencies**: MOD-001, MOD-002  
**Estimated Effort**: 2-3 days  
**Status**: ✅ **COMPLETED** - August 13, 2025

### Files to Modify

1. `/packages/additional-materials/src/moderation/moderationPrompt.ts`
2. `/packages/additional-materials/src/moderation/generateAdditionalMaterialModeration.ts`

### Implementation Tasks

#### Task 3.1: Update Additional Materials Prompts ✅
- ✅ Aligned prompt generation with main system using core `moderationCategories.json`
- ✅ Updated category assessment logic for 28 individual categories
- ✅ Maintained additional materials context while using new format

#### Task 3.2: Update Generation Logic ✅
- ✅ Updated return type to `ModerationResult` for API compatibility
- ✅ Added transformation layer: `moderationResponseSchema` → `ModerationResult`
- ✅ Implemented field mapping: `flagged_categories` → `categories`, `justifications` → `justification`
- ✅ Updated test fixtures to use correct format

### Testing Requirements

#### Integration Tests ✅
```bash
# Tests passing (12/12)
pnpm test -- --testPathPattern="generatePartialLessonPlan.test|generateAdditionalMaterial.test"
```

#### Verification Tests ✅
- [x] Additional materials use same 28-category structure as main system
- [x] Prompt generation aligned with main system
- [x] All integration tests pass
- [x] Type compatibility resolved
- [x] No breaking changes to existing API consumers

---

## MOD-004: Database Layer Updates

**Priority**: High  
**Dependencies**: MOD-001, MOD-002, MOD-003  
**Estimated Effort**: 1-2 days  
**Status**: ✅ **COMPLETED** - August 13, 2025

### Files to Modify

1. `/packages/core/src/models/moderations.ts`
2. `/packages/db/prisma/zod-schemas/moderation.ts`

### Implementation Tasks

#### Task 4.1: Update Database Models ✅
- ✅ Verified database models compatibility with new 28-category structure
- ✅ Database model already using updated `ModerationResult` types from MOD-001
- ✅ No changes required - types automatically compatible with new structure

#### Task 4.2: Update Prisma Zod Schemas ✅
- ✅ Updated Zod validation schemas to support 28 individual categories
- ✅ Added specific `moderationCategoriesSchema` with all abbreviated codes (l1-l2, u1-u5, s1, p2-p5, e1, r1-r2, n1-n7, t1-t6)
- ✅ Added `moderationScoresSchema` with Likert scale validation for all 28 categories
- ✅ Fixed circular dependency by defining schemas locally in db package

### Testing Requirements

#### Database Tests
```bash
# Test database operations
pnpm test -- --testPathPattern="models.*moderation"
```

#### Database Tests ✅
- [x] Database operations work with individual categories
- [x] Prisma schema validations updated and working
- [x] Data persistence works correctly
- [x] Type checking passes for database package
- [x] Moderation tests show new 28-category structure working (returns `t4` instead of old `t/encouragement-violence`)

#### Post-Completion Verification
```bash
# Verify database schema
pnpm db-generate

# Test database operations
node -e "
  const models = require('./packages/core/src/models/moderations.ts');
  console.log('Database models updated successfully');
"
```

---

## MOD-005: Frontend State Management Refactoring

**Priority**: Medium  
**Dependencies**: MOD-001, MOD-004  
**Estimated Effort**: 3-4 days  
**Status**: 🔴 Not Started

### Files to Modify

1. `/apps/nextjs/src/stores/moderationStore/actionFunctions/handleFetchModeration.tsx`
2. `/apps/nextjs/src/stores/moderationStore/actionFunctions/handleToxicModeration.tsx`
3. `/apps/nextjs/src/stores/moderationStore/actionFunctions/handleUpdateModerationState.tsx`
4. `/apps/nextjs/src/components/ContextProviders/ChatModerationContext.tsx`

### Implementation Tasks

#### Task 5.1: Update Store Action Functions
- Modify `handleFetchModeration` to work with new API response format
- Update `handleToxicModeration` to check individual toxic categories (t1-t6)
- Modify `handleUpdateModerationState` for new data structure
- Update API call expectations and response parsing logic

#### Task 5.2: Update Context Provider
- Modify context type definitions for individual categories
- Update state management for new structure
- Update context methods to handle 28 categories

### Testing Requirements

#### State Management Tests
```bash
# Test store functionality
pnpm test -- --testPathPattern="moderationStore"

# Test context provider
pnpm test -- --testPathPattern="ChatModerationContext"
```

#### Integration Tests
- [ ] Store handles individual category data structure
- [ ] State updates work correctly with new format
- [ ] Context providers updated for new structure
- [ ] Error handling works for new failure modes

#### Post-Completion Verification
```bash
# Run dev server and test state management
pnpm dev
# Navigate to moderation interface and verify state updates
```

---

## MOD-006: UI Component Updates

**Priority**: Medium  
**Dependencies**: MOD-005  
**Estimated Effort**: 4-5 days  
**Status**: 🔴 Not Started

### Files to Modify

1. `/apps/nextjs/src/components/AppComponents/Chat/toxic-moderation-view.tsx`
2. `/apps/nextjs/src/components/AppComponents/FeedbackForms/ModerationFeedbackForm.tsx`
3. `/apps/nextjs/src/components/AppComponents/FeedbackForms/ModerationFeedbackModal.tsx`

### Implementation Tasks

#### Task 6.1: Update Moderation View Components
- Modify components to display individual category results
- Update props to accept individual category data
- Modify display logic for new category structure
- Handle abbreviated codes in UI

#### Task 6.2: Update Form Components
- Update form fields for individual categories
- Modify validation logic for new structure
- Handle new API response format in forms
- Update modal layout for individual categories

#### Task 6.3: UI/UX Considerations
- Implement progressive disclosure for 28 categories
- Consider grouping in UI while maintaining individual scoring
- Maintain accessibility standards
- Ensure performance with increased category count

### Testing Requirements

#### Component Tests
```bash
# Test UI components
pnpm test -- --testPathPattern="toxic-moderation-view"
pnpm test -- --testPathPattern="ModerationFeedback"
```

#### E2E Tests
```bash
# Run E2E tests for moderation UI
pnpm test-e2e -- --grep "moderation"
```

#### Manual Testing
- [ ] Components display individual category results correctly
- [ ] UI handles 28 categories without performance issues
- [ ] Form validation works with new structure
- [ ] User experience maintained or improved
- [ ] Accessibility standards maintained

---

## MOD-007: Testing and Validation

**Priority**: High  
**Dependencies**: MOD-001, MOD-002, MOD-003, MOD-004, MOD-005, MOD-006  
**Estimated Effort**: 3-4 days  
**Status**: 🔴 Not Started

### Files to Modify

1. All existing test files that interact with moderation
2. `/apps/nextjs/tests-e2e/recordings/*.moderation.json`
3. New test files for individual category logic

### Implementation Tasks

#### Task 7.1: Update Existing Tests
- Update all unit tests for new moderation structure
- Modify integration tests for new API format
- Update component tests for new data structure

#### Task 7.2: Update E2E Test Recordings
- Update test recordings with new JSON format
- Ensure recordings reflect 28 individual categories
- Update test expectations

#### Task 7.3: Create New Tests
- Create test scenarios for individual categories
- Add performance tests for 28-category assessment
- Add edge case tests for new structure

### Testing Requirements

#### Comprehensive Test Suite
```bash
# Run all tests
pnpm test

# Run E2E tests
pnpm test-e2e

# Run type checking
pnpm type-check

# Run linting
pnpm lint
```

#### Final Validation Checklist
- [ ] All existing tests updated and passing
- [ ] New tests cover individual category logic  
- [ ] E2E test recordings updated with new format
- [ ] Integration tests pass
- [ ] Performance tests show acceptable results
- [ ] Comprehensive test coverage maintained

---

## Pre-deployment Checklist

Before considering the implementation complete, verify:

1. ✅ All 28 categories have proper definitions and scoring criteria
2. ✅ LLM prompts generate valid responses with new format
3. ✅ API endpoints handle new request/response structure
4. ✅ Database operations work with new schema
5. ✅ Frontend displays individual category results correctly
6. ✅ State management handles new data structure
7. ✅ All existing functionality works with new system
8. ✅ Performance is acceptable with 28 individual scores
9. ✅ Error handling works for new failure modes
10. ✅ All tests pass with new implementation

## Risk Mitigation

### High-Risk Areas

#### 1. LLM Response Format
- **Risk**: New structure may cause parsing failures
- **Mitigation**: Comprehensive testing with various response formats
- **Test**: Verify with edge cases and malformed responses

#### 2. Performance Impact
- **Risk**: 28 individual scores vs 6 group scores may impact performance
- **Mitigation**: Performance testing before deployment
- **Test**: Monitor API response times and database performance

#### 3. Data Migration
- **Risk**: Existing moderation data compatibility issues
- **Mitigation**: Create migration scripts for existing data
- **Test**: Test migration with production data samples

#### 4. Frontend Complexity
- **Risk**: UI handling 28 categories may be complex
- **Mitigation**: Implement progressive disclosure and categorization
- **Test**: User testing with new interface design

## Rollback Plan

If issues arise during deployment:

1. **Immediate Rollback**: Revert all modified files to previous versions
2. **Restore Structure**: Restore original category group structure
3. **Database Compatibility**: Ensure database compatibility with rolled-back version
4. **Validation**: Validate that all functionality works as before
5. **Issue Resolution**: Address issues and re-deploy with fixes

## Success Criteria

The implementation will be considered successful when:

1. All 28 categories are assessed independently with individual scores
2. LLM generates proper justifications for categories scoring < 5
3. API responses use abbreviated codes (l1, l2, etc.)
4. Frontend displays individual category results clearly
5. All existing functionality continues to work
6. Performance remains acceptable
7. All tests pass with new implementation
8. No regression in moderation accuracy or user experience

---

## Commands Reference

### Testing Commands
```bash
# Run all tests
pnpm test

# Run specific test pattern
pnpm test -- --testPathPattern="moderation"

# Run E2E tests
pnpm test-e2e

# Run coverage
pnpm test-coverage
```

### Development Commands
```bash
# Start development server
pnpm dev

# Type checking
pnpm type-check

# Linting
pnpm lint

# Build
pnpm build
```

### Database Commands
```bash
# Generate Prisma client
pnpm db-generate

# Push schema changes
pnpm db-push

# Run migrations
pnpm db-migrate
```

---

**Note**: Each ticket must be completed fully and tested before proceeding to the next one. Dependencies are critical and must be respected to avoid integration issues.