import { aiLogger } from "@oakai/logger";

import { openai } from "@ai-sdk/openai";
import { Output, generateText } from "ai";
import { z } from "zod";

import {
  type SlidesAgentResponse,
  bulkChangesSchema,
  normalizeAgentResponse,
  targetedChangesSchema,
} from "../schemas/plan";
import type { SlideContent } from "../slides/extraction/types";
import type { EditScope } from "./coordinatorAgent";
import { type SimplifiedSlideContent, formatSlidesForPrompt } from "./utils";

const log = aiLogger("adaptations");

// ---------------------------------------------------------------------------
// Intent Configuration
// ---------------------------------------------------------------------------

type SlideField = "textElements" | "tables" | "images" | "shapes";

interface IntentConfig {
  /** System prompt for this intent */
  prompt: string;
  /** Response schema (bulk = no per-change reasoning, targeted = with reasoning) */
  schema: typeof bulkChangesSchema | typeof targetedChangesSchema;
  /** Which slide fields to include in the prompt (reduces token usage) */
  slideFields: SlideField[];
  /** Number of slides per batch (smaller = faster per-batch, more API calls) */
  batchSize?: number;
}

const DEFAULT_BATCH_SIZE = 20;
const LLM_TIMEOUT_MS = 300_000; // 5 minutes per batch

/**
 * Shared rules appended to every intent-specific prompt.
 */
const SHARED_RULES = `
## CRITICAL: newText must be actual rewritten text
For every text edit or table cell edit, the newText field must contain the ACTUAL rewritten text.
- CORRECT: newText: "Plants use light to make food."
- WRONG: newText: "Simplified version of the original text about photosynthesis"
- WRONG: newText: "This text has been rewritten for a lower reading age"

## Slide accounting
Check every slide in the input.

## CRITICAL: Use the exact element IDs from the input
Each text element has an elementId shown as [elementId: xxx]. You MUST use the exact elementId from the input for the elementId field in text edits and text element deletions.
- CORRECT: elementId: "p42_i1629" (copied from the input)
- WRONG: elementId: "1" (this is the list number, not the element ID)
- WRONG: elementId: "element1" (invented ID)

## Table cells
Each table has a tableId and each cell has a composite cell ID shown as [cellId]. For table cell edits, use the composite cell ID format: {tableId}_r{row}c{col}

## Change IDs
Each change needs a unique changeId:
- Text edits: "te-{slideNumber}-{index}"
- Table cell edits: "tce-{slideNumber}-{index}"
- Text element deletions: "ted-{slideNumber}-{index}"
- Slide deletions: "sd-{slideNumber}"`;

/**
 * Intent configuration registry.
 * Single source of truth for prompt, schema, and slide content per intent.
 * To add a new intent: add an entry here and in the coordinator's INTENT_CONFIG.
 */
const INTENT_CONFIGS: Record<string, IntentConfig> = {
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
    batchSize: 20,
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

const SUPPORTED_EDIT_TYPES = Object.keys(INTENT_CONFIGS);

// ---------------------------------------------------------------------------
// Input Schema
// ---------------------------------------------------------------------------

export const generateSlidePlanInputSchema = z.object({
  editType: z.string().refine((v) => SUPPORTED_EDIT_TYPES.includes(v), {
    message: `editType must be one of: ${SUPPORTED_EDIT_TYPES.join(", ")}`,
  }),
  userMessage: z.string().min(1),
  slides: z.custom<SlideContent[]>(
    (val) => Array.isArray(val) && val.length > 0,
    { message: "slides must be a non-empty array" },
  ),
});

export type GenerateSlidePlanInput = z.infer<
  typeof generateSlidePlanInputSchema
>;

// ---------------------------------------------------------------------------
// Slide Content Filtering
// ---------------------------------------------------------------------------

/**
 * Filters slide content based on the intent's slideFields config.
 */
function filterSlideContent(
  slides: SlideContent[],
  fields: SlideField[],
): SimplifiedSlideContent[] {
  return slides.map((slide) => {
    const filtered: SimplifiedSlideContent = {
      slideNumber: slide.slideNumber,
      slideId: slide.slideId,
      slideTitle: slide.slideTitle,
    };

    if (fields.includes("textElements")) {
      filtered.textElements = slide.textElements;
    }
    if (fields.includes("tables")) {
      filtered.tables = slide.tables;
    }
    if (fields.includes("images")) {
      filtered.images = slide.nonTextElements
        .filter((el) => el.type === "image")
        .map((el) => ({ id: el.id, description: el.description }));
    }
    if (fields.includes("shapes")) {
      filtered.shapes = slide.nonTextElements
        .filter((el) => el.type === "shape")
        .map((el) => ({ id: el.id, description: el.description }));
    }

    return filtered;
  });
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * Builds sets of valid IDs from the input slides and filters out any
 * changes in the LLM output that reference non-existent elements.
 * This prevents hallucinated IDs from reaching the Google Slides API.
 */
function validateAgentOutput(
  output: SlidesAgentResponse,
  inputSlides: SlideContent[],
): SlidesAgentResponse {
  const validElementIds = new Set<string>();
  const validSlideIds = new Set<string>();
  const validCellIds = new Set<string>();

  for (const slide of inputSlides) {
    validSlideIds.add(slide.slideId);
    for (const te of slide.textElements) {
      validElementIds.add(te.id);
    }
    for (const table of slide.tables) {
      for (const row of table.cells) {
        for (const cell of row) {
          validCellIds.add(cell.id);
        }
      }
    }
  }

  const textEdits = output.changes.textEdits.filter((edit) => {
    if (!validElementIds.has(edit.elementId)) {
      log.warn(
        `Filtering out text edit with invalid elementId: "${edit.elementId}" (changeId: ${edit.changeId})`,
      );
      return false;
    }
    return true;
  });

  const tableCellEdits = output.changes.tableCellEdits.filter((edit) => {
    if (!validCellIds.has(edit.cellId)) {
      log.warn(
        `Filtering out table cell edit with invalid cellId: "${edit.cellId}" (changeId: ${edit.changeId})`,
      );
      return false;
    }
    return true;
  });

  const textElementDeletions = output.changes.textElementDeletions.filter(
    (deletion) => {
      if (!validElementIds.has(deletion.elementId)) {
        log.warn(
          `Filtering out text element deletion with invalid elementId: "${deletion.elementId}" (changeId: ${deletion.changeId})`,
        );
        return false;
      }
      return true;
    },
  );

  const slideDeletions = output.changes.slideDeletions.filter((deletion) => {
    if (!validSlideIds.has(deletion.slideId)) {
      log.warn(
        `Filtering out slide deletion with invalid slideId: "${deletion.slideId}" (changeId: ${deletion.changeId})`,
      );
      return false;
    }
    return true;
  });

  const totalOriginal =
    output.changes.textEdits.length +
    output.changes.tableCellEdits.length +
    output.changes.textElementDeletions.length +
    output.changes.slideDeletions.length;

  const totalValid =
    textEdits.length +
    tableCellEdits.length +
    textElementDeletions.length +
    slideDeletions.length;

  const filteredCount = totalOriginal - totalValid;

  if (filteredCount > 0) {
    log.warn(
      `Filtered out ${filteredCount}/${totalOriginal} changes with invalid IDs`,
    );
  }

  return {
    ...output,
    changes: {
      textEdits,
      tableCellEdits,
      textElementDeletions,
      slideDeletions,
      slidesToKeep: output.changes.slidesToKeep,
    },
  };
}

// ---------------------------------------------------------------------------
// LLM Call
// ---------------------------------------------------------------------------

/**
 * Makes a single LLM call for a set of slides and returns the normalized response.
 */
async function callSlidesAgent(
  config: IntentConfig,
  editType: string,
  userMessage: string,
  slides: SimplifiedSlideContent[],
): Promise<SlidesAgentResponse | undefined> {
  const formattedSlides = formatSlidesForPrompt(slides);
  const prompt = `Edit type: ${editType}
User message: ${userMessage}

# Slides to Analyse
${formattedSlides}

---`;

  const { output, text } = await generateText({
    model: openai("gpt-4o-mini"),
    output: Output.object({ schema: config.schema }),
    system: config.prompt,
    prompt,
    abortSignal: AbortSignal.timeout(LLM_TIMEOUT_MS),
  });

  if (!output) {
    log.error(
      "Slides agent: output is undefined — model response failed schema validation. Raw text: %s",
      text,
    );
    return undefined;
  }

  return normalizeAgentResponse(output);
}

// ---------------------------------------------------------------------------
// Batch Processing
// ---------------------------------------------------------------------------

/**
 * Splits slides into batches and processes them in parallel using Promise.allSettled.
 * This significantly reduces wall-clock time for large presentations.
 */
async function processInBatches(
  config: IntentConfig,
  editType: string,
  userMessage: string,
  slides: SimplifiedSlideContent[],
): Promise<SlidesAgentResponse | undefined> {
  const batchSize = config.batchSize ?? DEFAULT_BATCH_SIZE;
  const batches: SimplifiedSlideContent[][] = [];
  for (let i = 0; i < slides.length; i += batchSize) {
    batches.push(slides.slice(i, i + batchSize));
  }

  log.info(
    `Processing ${batches.length} batches of up to ${batchSize} slides in parallel`,
  );

  const results = await Promise.allSettled(
    batches.map((batch, idx) => {
      log.info(`Starting batch ${idx + 1}/${batches.length}`);
      return callSlidesAgent(config, editType, userMessage, batch);
    }),
  );

  const batchResults: SlidesAgentResponse[] = [];
  for (const [idx, result] of results.entries()) {
    if (result.status === "fulfilled" && result.value) {
      batchResults.push(result.value);
    } else if (result.status === "rejected") {
      log.error(`Batch ${idx + 1}/${batches.length} failed: ${result.reason}`);
    } else {
      log.warn(`Batch ${idx + 1}/${batches.length} returned no output`);
    }
  }

  if (batchResults.length === 0) {
    log.error("All batches failed to produce output");
    return undefined;
  }

  log.info(
    `Completed ${batchResults.length}/${batches.length} batches successfully`,
  );

  return mergeBatchResults(batchResults);
}

/**
 * Merges multiple batch results into a single SlidesAgentResponse.
 */
function mergeBatchResults(
  results: SlidesAgentResponse[],
): SlidesAgentResponse {
  return {
    analysis: results.map((r) => r.analysis).join("\n\n"),
    changes: {
      textEdits: results.flatMap((r) => r.changes.textEdits),
      tableCellEdits: results.flatMap((r) => r.changes.tableCellEdits),
      textElementDeletions: results.flatMap(
        (r) => r.changes.textElementDeletions,
      ),
      slideDeletions: results.flatMap((r) => r.changes.slideDeletions),
      slidesToKeep: results.flatMap((r) => r.changes.slidesToKeep),
    },
    reasoning: results.map((r) => r.reasoning).join("\n\n"),
  };
}

// ---------------------------------------------------------------------------
// Entry Point
// ---------------------------------------------------------------------------

export async function generateSlidePlan(
  input: GenerateSlidePlanInput,
  scope: EditScope = "global",
): Promise<SlidesAgentResponse | undefined> {
  try {
    log.info("Generating slide plan", {
      editType: input.editType,
      userMessage: input.userMessage,
      slideCount: input.slides.length,
      scope,
    });

    const parsed = generateSlidePlanInputSchema.parse(input);
    const config = INTENT_CONFIGS[parsed.editType];

    if (!config) {
      throw new Error(
        `No config registered for editType: "${parsed.editType}". ` +
          `Available: ${SUPPORTED_EDIT_TYPES.join(", ")}`,
      );
    }

    const slidesForPrompt = filterSlideContent(parsed.slides, config.slideFields);
    const batchSize = config.batchSize ?? DEFAULT_BATCH_SIZE;
    const shouldBatch = scope === "global" && slidesForPrompt.length > batchSize;

    const output = shouldBatch
      ? await processInBatches(config, parsed.editType, parsed.userMessage, slidesForPrompt)
      : await callSlidesAgent(config, parsed.editType, parsed.userMessage, slidesForPrompt);

    if (!output) {
      return undefined;
    }

    const validated = validateAgentOutput(output, parsed.slides);

    log.info("Generated slide plan", {
      textEdits: validated.changes.textEdits.length,
      tableCellEdits: validated.changes.tableCellEdits.length,
      textElementDeletions: validated.changes.textElementDeletions.length,
      slideDeletions: validated.changes.slideDeletions.length,
    });

    return validated;
  } catch (error) {
    log.error(
      "Error generating slide plan: %s",
      error instanceof Error ? error.message : String(error),
    );
    throw error;
  }
}

export type { SlidesAgentResponse };
