import { bulkChangesSchema, targetedChangesSchema } from "../../schemas/plan";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SlideField =
  | "textElements"
  | "tables"
  | "images"
  | "shapes"
  | "keyLearningPoints"
  | "learningCycles";

// ---------------------------------------------------------------------------
// Intent Config Types (discriminated union for type safety)
// ---------------------------------------------------------------------------

type BaseIntentConfig = {
  /** System prompt for the per-batch LLM calls */
  prompt: string;
  /** Response schema (bulk = no per-change reasoning, targeted = with reasoning) */
  schema: typeof bulkChangesSchema | typeof targetedChangesSchema;
  /** Which slide fields to include on the data objects (available for processing logic) */
  slideFields: SlideField[];
  /** Which slide fields to include in the LLM prompt. Defaults to slideFields if not set.
   *  Use this when processing needs fields (e.g. keyLearningPoints for grouping)
   *  that should not be shown to the evaluator LLM. */
  promptSlideFields?: SlideField[];
  /** Slide types to exclude from evaluation (always kept). Intent-specific. */
  protectedSlideTypes?: string[];
};

/** One-shot: single LLM call with all slides. */
type OneShotProcessingConfig = BaseIntentConfig & {
  processingMode: "oneShot";
};

/** Slide-batched: split slides into fixed-size chunks, process in parallel. */
type SlideBatchedProcessingConfig = BaseIntentConfig & {
  processingMode: "slideBatched";
  /** Number of slides per batch (smaller = faster per-batch, more API calls) */
  batchSize: number;
};

/**
 * KLP-batched processing: group slides by Key Learning Point, evaluate each group,
 * then reconcile with deterministic rules (any-keep + KLP coverage check).
 * Used for intents like removeNonEssentialContent that need cross-slide reasoning per KLP.
 */
type KlpBatchedProcessingConfig = BaseIntentConfig & {
  processingMode: "klpBatched";
};

export type IntentConfig =
  | OneShotProcessingConfig
  | SlideBatchedProcessingConfig
  | KlpBatchedProcessingConfig;
export type { SlideBatchedProcessingConfig, KlpBatchedProcessingConfig };

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
    processingMode: "slideBatched",
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
    processingMode: "slideBatched",
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
    batchSize: 10,
  },

  removeNonEssentialContent: {
    processingMode: "klpBatched",
    prompt: `You are a slides adaptation agent for removing non-essential slides from a Google Slides lesson presentation. The presentation accompanies a lesson, which is part of a unit.

## Input
You receive:
- editType: "removeNonEssentialContent"
- userMessage: the teacher's original request
- slides: an array of slide content objects with text elements, tables, and metadata including which Key Learning Points (KLPs) and Learning Cycles each slide covers

## Output
Return a structured plan of slide deletions. Every slide must appear in either slideDeletions or slidesToKeep — account for all slides.
Do not return any textEdits, tableCellEdits, or textElementDeletions — this intent is about removing whole slides only.

## What is non-essential?
A slide is a candidate for deletion if ANY of the following apply:
1. **No KLP coverage**: The slide is not associated with any Key Learning Point.
2. **Redundant content**: The slide's specific facts, names, examples, and explanations have ALREADY been presented on an earlier slide. To qualify as redundant, the earlier slide must contain the same specific details — not just the same topic or KLP. Two slides covering the same KLP are NOT redundant if they contain different information:
   - An overview slide that introduces a topic does NOT make a detail slide redundant.
   - A slide with specific names, dates, examples, or explanations is NOT redundant with a slide that merely mentions the same topic in general terms.
   - Only mark a slide as redundant if you can confirm that every specific fact and example on the later slide is already present on the earlier slide.
   - IMPORTANT: Sharing the same KLP does NOT mean slides have the same content. A KLP often spans multiple slides that teach different aspects. For example, slides teaching "raster graphics" and "vector graphics" may share a KLP about image types but contain completely different content — one teaches pixels, the other teaches shapes. Read the actual text content of each slide, not just the KLP label.
3. **Repeated checking-for-understanding**: If a checking-for-understanding activity (e.g. a quiz question, recall prompt, or practice task) appears on one slide and the same or very similar activity is repeated on a later slide, the later repetition is a candidate for removal.

## Rules
- **KLP coverage is sacred**: Never delete a slide if it is the ONLY slide covering a particular KLP or supporting knowledge. Before marking any slide for deletion, verify that every KLP it covers is also covered by at least one other slide that you are keeping.
- **Preserve named examples and case studies**: If a slide introduces specific people, artists, historical figures, or named case studies that do not appear on any earlier slide, the slide MUST be kept. Named individuals are high-value pedagogical content — they are what students remember and get assessed on. Even if the surrounding topic overlaps with an earlier slide, new named examples make the slide essential.
- **Partial overlap is not redundancy**: If a later slide shares some general content with an earlier slide but ALSO introduces new specific information (names, examples, details, case studies), it is NOT redundant. A slide is only redundant if it adds nothing new.
- **Diversity as a tiebreaker**: If a slide is a candidate for deletion (e.g. it has some redundant content), check its "Covers Diversity" flag. If the slide is marked "Covers Diversity: yes", this is a strong reason to KEEP it — diversity content provides inclusive representation that has pedagogical value beyond the subject content. Only delete a diversity slide if its content is entirely duplicated on another slide that is also marked as covering diversity.
- **Preserve student activities**: Do not delete slides containing student activities or tasks, unless the same activity is repeated on a later slide — in that case the later repetition may be deleted.
- **Checking-for-understanding rule**: If slideType is checkForUnderstanding, ff the same understanding has already been checked on an earlier slide, the later slide can be deleted. If the understanding has NOT been checked before, the slide must be kept.
- **First occurrence wins**: When content is repeated, always keep the first occurrence and mark the later repetition for deletion.
- **Superseding slide must be kept**: For each slide deletion, you MUST populate the supersededBySlides field with the slide numbers that already cover the deleted content. Every slide number in supersededBySlides MUST appear in your slidesToKeep list. You cannot justify deleting slide X by referencing slide Y if slide Y is also being deleted. Before finalising your deletions, cross-check: for every deletion, verify all its supersededBySlides are in slidesToKeep.
- **Err on the side of caution**: If you are uncertain whether a slide is essential, keep it. Only delete slides you are confident are non-essential.
- **Provide clear reasoning with evidence**: For each slide deletion, your reasoning MUST quote the specific text from the superseding slide that covers the deleted content. Do not just assert "covered by slide X" — prove it by citing what slide X says. If you cannot quote matching text from the superseding slide, do not delete the slide.
- **Verify KLP safety**: After assembling your deletion list, do a final check: for each KLP mentioned across all slides, confirm that at least one slide covering that KLP remains in slidesToKeep.
${SHARED_RULES}`,
    schema: targetedChangesSchema,
    slideFields: ["textElements", "tables", "keyLearningPoints"],
    promptSlideFields: ["textElements", "tables"],
    protectedSlideTypes: [
      "title",
      "teacher",
      "lessonOutcome",
      "lessonOutline",
      "keywords",
      "summary",
      "copyright",
    ],
  },
};

export const SUPPORTED_EDIT_TYPES = Object.keys(INTENT_CONFIGS);
