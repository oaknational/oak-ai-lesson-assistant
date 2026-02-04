import { bulkChangesSchema, targetedChangesSchema } from "../../schemas/plan";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SlideField = "textElements" | "tables" | "images" | "shapes";

export interface IntentConfig {
  /** System prompt for this intent */
  prompt: string;
  /** Response schema (bulk = no per-change reasoning, targeted = with reasoning) */
  schema: typeof bulkChangesSchema | typeof targetedChangesSchema;
  /** Which slide fields to include in the prompt (reduces token usage) */
  slideFields: SlideField[];
  /** Number of slides per batch (smaller = faster per-batch, more API calls) */
  batchSize?: number;
}

// ---------------------------------------------------------------------------
// Shared Rules
// ---------------------------------------------------------------------------

/**
 * Shared rules appended to every intent-specific prompt.
 */
export const SHARED_RULES = `
## CRITICAL: newText must be actual rewritten text
For every text edit or table cell edit, the newText field must contain the ACTUAL rewritten text.
- CORRECT: newText: "Plants use light to make food."
- WRONG: newText: "Simplified version of the original text about photosynthesis"
- WRONG: newText: "This text has been rewritten for a lower reading age"

## CRITICAL: Preserve exact spacing and newlines
When providing newText, you MUST preserve ALL whitespace exactly as it appears in the original:
- Keep all newlines (\\n) in the exact same positions
- Keep all leading and trailing spaces
- Keep all tabs and indentation
- CORRECT: newText: "Line 1\\nLine 2\\n" (preserves newline at end)
- WRONG: newText: "Line 1\\nLine 2" (missing trailing newline)
- This ensures the rewritten text has the same shape and formatting as the original when applied back to the slide.

## Slide accounting
Check every slide in the input.

## CRITICAL: Use the exact element IDs from the input
Each text element has an elementId shown as [elementId: xxx]. You MUST use the exact elementId from the input for the elementId field in text edits and text element deletions.
- CORRECT: elementId: "p42_i1629" (copied from the input)
- WRONG: elementId: "1" (this is the list number, not the element ID)
- WRONG: elementId: "element1" (invented ID)

## Table cells
Each table has a tableId and each cell has a composite cell ID shown as [cellId]. For table cell edits, use the composite cell ID format: {tableId}_r{row}c{col}`;

// ---------------------------------------------------------------------------
// Intent Configuration Registry
// ---------------------------------------------------------------------------

/**
 * Intent configuration registry.
 * Single source of truth for prompt, schema, and slide content per intent.
 * To add a new intent: add an entry here and in the coordinator's INTENT_CONFIG.
 */
export const INTENT_CONFIGS: Record<string, IntentConfig> = {
  changeReadingAge: {
    prompt: `You are a slides adaptation agent for changing the reading age of lesson content in a Google Slides presentation. The presentation accompanies a lesson, which is part of a unit.

## Input
You receive:
- editType: "changeReadingAge"
- userMessage: the teacher's original request (includes target reading age, or lower/higher)
- slides: an array of slide content objects with text elements, tables, and non-text elements

## Output
Return a structured plan of changes.

## Rules
- Do not change any slides that are for teachers; leave teacher slides untouched.
- Do not change words that are important to the lesson, such as "unit" or "lesson"; preserve these terms exactly as they appear.
- If increasing the reading age, keep the rewritten text roughly the same number of characters as the original. Slightly more is acceptable if needed for clarity.
- Use shorter sentences appropriate to the target reading age when lowering it.
- Replace complex vocabulary with simpler alternatives, except for subject-specific terminology that is pedagogically important (e.g. "photosynthesis", "equation").
- Simplify sentence structures: prefer active voice, fewer clauses.
- Keep numerical data and proper nouns unchanged.
- Preserve slide structure and layout.
- Check every included slide for potential edits.
${SHARED_RULES}`,
    schema: bulkChangesSchema,
    slideFields: ["textElements", "tables"],
    batchSize: 10,
  },

  translateLesson: {
    prompt: `You are a slides adaptation agent for translating lesson content in a Google Slides presentation.

## Input
You receive:
- editType: "translateLesson"
- userMessage: the teacher's original request (includes target language)
- slides: an array of slide content objects with text elements, tables, and non-text elements

## Output
Return a structured plan of changes.

## Rules
- Translate all text elements and table contents from every slide into the target language specified in the userMessage.
- Ensure that translations use roughly the same amount of characters so text will fit within the slide text boxes.
- Do not translate proper nouns, technical terms, or specific educational terminology that should remain in the original language.
- Maintain the original meaning and context of the content while ensuring cultural appropriateness for the target language audience.
- Preserve slide structure and layout.
- Check every included slide for potential edits.
${SHARED_RULES}`,
    schema: bulkChangesSchema,
    slideFields: ["textElements", "tables"],
    batchSize: 10, // Smaller batches for translation (more output tokens)
  },
};

export const SUPPORTED_EDIT_TYPES = Object.keys(INTENT_CONFIGS);
