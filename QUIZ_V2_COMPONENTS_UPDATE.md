# Quiz V2 Components Update

## Overview
This document tracks the consolidation of quiz v2 question types and styling updates.

## Completed Work

### Branch Consolidation
- Created `feat/question-types` branch that consolidates:
  - `feat/quiz-order-v2` (PR #742)
  - `feat/quiz-match-v2` (PR #741) 
  - `feat/quiz-short-answer-v2` (PR #740)
- Created new PR #750 to replace the individual PRs
- Closed the original PRs with comments explaining the replacement

### Components Added
1. **OrderQuestion** - Displays items that need to be put in order
2. **MatchQuestion** - Displays items to be matched with their pairs
3. **ShortAnswerQuestion** - Displays short answer questions

### Code Changes
- Updated `QuizSection/index.tsx` to use a switch statement for rendering all question types
- Added shuffle functions for order and match questions in `shuffle.ts`

## Styling Updates

### Check Mark Color
- Updated the tick icon color in `MultipleChoiceQuestion.tsx` from `text-inverted` to `icon-success` (green)
- Oak uses `icon-success` for correct/success states (found in `StepFour.tsx`)

### AnswerCheckbox Component
- Created a reusable `AnswerCheckbox` component with compound pattern
- Includes `AnswerCheckbox.Check` sub-component for the green tick
- Applied to:
  - `MultipleChoiceQuestion`: Shows green tick for correct answers
  - `OrderQuestion`: Shows green numbers (1, 2, 3, etc.) in boxes
  - `MatchQuestion`: Shows green letters (a, b, c, etc.) in boxes
  - `ShortAnswerQuestion`: No checkbox needed (displays answer inline or separately)

## TODO

### Border Color Update
- **Note**: We should use `black-200` instead of `black` for the checkbox borders in `AnswerCheckbox.tsx`
- Current: `$borderColor="black"`
- Should be: `$borderColor="black-200"`

### Future Considerations
- Consider updating other quiz components to use consistent Oak color tokens
- Review accessibility of color choices