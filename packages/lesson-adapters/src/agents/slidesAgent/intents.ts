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
  /** Which slide fields to include in the prompt (reduces token usage) */
  slideFields: SlideField[];
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
 * then reconcile with an orchestrator agent.
 * Used for intents like removeNonEssentialContent that need cross-slide reasoning per KLP.
 */
type KlpBatchedProcessingConfig = BaseIntentConfig & {
  processingMode: "klpBatched";
  /** System prompt for the orchestrator agent that coordinates KLP evaluations */
  orchestratorPrompt: string;
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
2. **Redundant content**: The slide covers a KLP, but that same content has already been substantially covered by an earlier slide. The earlier slide should be kept; the later repetition is the candidate for removal.
3. **Repeated checking-for-understanding**: If a checking-for-understanding activity (e.g. a quiz question, recall prompt, or practice task) appears on one slide and the same or very similar activity is repeated on a later slide, the later repetition is a candidate for removal.

## Rules
- **KLP coverage is sacred**: Never delete a slide if it is the ONLY slide covering a particular KLP or supporting knowledge. Before marking any slide for deletion, verify that every KLP it covers is also covered by at least one other slide that you are keeping.
- **Preserve diversity slides**: Slides marked as "Covers Diversity: yes" should be kept, as they contribute to inclusive representation in the lesson.
- **Preserve student activities**: Do not delete slides containing student activities or tasks, unless the same activity is repeated on a later slide — in that case the later repetition may be deleted.
- **Checking-for-understanding rule**: If slideType is checkForUnderstanding, ff the same understanding has already been checked on an earlier slide, the later slide can be deleted. If the understanding has NOT been checked before, the slide must be kept.
- **First occurrence wins**: When content is repeated, always keep the first occurrence and mark the later repetition for deletion.
- **Err on the side of caution**: If you are uncertain whether a slide is essential, keep it. Only delete slides you are confident are non-essential.
- **Provide clear reasoning**: For each slide deletion, explain specifically why the slide is non-essential (which earlier slide already covers the content, or why the slide has no KLP relevance).
- **Verify KLP safety**: After assembling your deletion list, do a final check: for each KLP mentioned across all slides, confirm that at least one slide covering that KLP remains in slidesToKeep.
${SHARED_RULES}`,
    schema: targetedChangesSchema,
    slideFields: ["textElements", "tables", "keyLearningPoints"],
    protectedSlideTypes: [
      "title",
      "teacher",
      "lessonOutcome",
      "lessonOutline",
      "keywords",
      "summary",
      "copyright",
    ],
    orchestratorPrompt: `You are an orchestrator agent that coordinates the removal of non-essential slides from a lesson presentation.

## Your Role
You have a tool called "evaluateKlpSlides" that evaluates slides grouped by Key Learning Point (KLP). Your job is to:
1. Call this tool once for each KLP group to get deletion recommendations
2. Also call it for the "__unattached__" group (slides with no KLP)
3. Reconcile any conflicts when a slide appears in multiple KLP groups
4. Output a final unified plan

## Using Enriched Deletion Context
Each deletion recommendation from the tool includes enriched context:
- **slideTitle**: The slide's title
- **slideTextContent**: The full text content from the slide
- **allKeyLearningPoints**: ALL KLPs this slide covers (not just the one being evaluated)
- **isMultiKlpSlide**: Whether this slide covers more than one KLP

When \`isMultiKlpSlide\` is true, you MUST review the slide's \`slideTextContent\` and \`allKeyLearningPoints\` before accepting the deletion. A per-KLP evaluator only sees the slide through the lens of one KLP — the slide may contain content essential to other KLPs that the evaluator was not assessing. Use the text content to verify that no unique pedagogical content would be lost.

## Conflict Resolution
Some slides cover multiple KLPs and will appear in more than one tool result. When different KLP evaluations give conflicting recommendations for the same slide:

1. **Any-keep rule**: If ANY KLP evaluation says "keep" because the slide provides essential coverage for that KLP, the slide must be kept — even if another KLP evaluation flagged it as redundant for a different KLP.
2. **Cross-KLP awareness**: A slide may contain redundant content for KLP-A (because an earlier slide already covers KLP-A), but it may be the only slide covering KLP-B. In this case the slide is essential and must be kept.
3. **Unanimous deletion only**: A slide is safe to delete ONLY if ALL KLP evaluations that include it agree it is non-essential AND it is not a protected slide type.

## Post-Reconciliation Validation
Before producing your final output, verify:
1. **KLP coverage**: For every KLP mentioned across all slides, at least one slide covering that KLP remains in slidesToKeep.
2. **Protected slides**: None of the protected slide types listed above appear in slideDeletions.
3. **Complete accounting**: Every slide from the input appears in exactly one of slideDeletions or slidesToKeep — none are missing.

If any check fails, move the affected slide from slideDeletions to slidesToKeep.

## Output
After calling the tool for each KLP group, synthesize the results into your final structured output:
- slideDeletions: slides that are safe to remove (with reasoning)
- slidesToKeep: all other slides
- Every slide must appear in exactly one of these arrays`,
  },
};

export const SUPPORTED_EDIT_TYPES = Object.keys(INTENT_CONFIGS);
