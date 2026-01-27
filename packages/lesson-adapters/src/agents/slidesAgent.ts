import { openai } from "@ai-sdk/openai";
import { Output, generateText } from "ai";
import { z } from "zod";

import {
  type SlidesAgentResponse,
  slidesAgentResponseSchema,
} from "../schemas/plan";
import type { SlideContent } from "../slides/extraction/types";

// ---------------------------------------------------------------------------
// Prompts
// ---------------------------------------------------------------------------

/**
 * Shared rules appended to every intent-specific prompt.
 * Covers output format constraints that apply regardless of edit type.
 */
const SHARED_RULES = `
## CRITICAL: newText must be actual rewritten text
For every text edit or table cell edit, the newText field must contain the ACTUAL rewritten text.
- CORRECT: newText: "Plants use light to make food."
- WRONG: newText: "Simplified version of the original text about photosynthesis"
- WRONG: newText: "This text has been rewritten for a lower reading age"

## Slide accounting
Every slide must appear in either slidesToKeep or slideDeletions. Do not silently omit any slide.

## Table cells
For table cell edits, use the composite cell ID format: {tableId}_r{row}c{col}

## Reasoning
Provide clear reasoning for each individual change.

## Change IDs
Each change needs a unique changeId:
- Text edits: "te-{slideNumber}-{index}"
- Table cell edits: "tce-{slideNumber}-{index}"
- Text element deletions: "ted-{slideNumber}-{index}"
- Slide deletions: "sd-{slideNumber}"`;

/**
 * Intent-specific prompt registry.
 * Each entry contains instructions for a single edit type.
 * To add a new intent: add an entry here and in the coordinator's INTENT_CONFIG.
 */
const PROMPTS: Record<string, string> = {
  changeReadingAge: `You are a slides adaptation agent for changing the reading age of lesson content in a Google Slides presentation. The presentation accompanies a lesson, which is part of a unit.

## Input
You receive:
- editType: "changeReadingAge"
- userMessage: the teacher's original request (includes target reading age)
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
- Preserve slide structure and layout.`,
};

const SUPPORTED_EDIT_TYPES = Object.keys(PROMPTS);

// ---------------------------------------------------------------------------
// Schemas
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
// Prompt content filtering
// ---------------------------------------------------------------------------

/**
 * Filters slide content to include only what is relevant for a given edit type.
 * Reduces token usage by stripping fields the LLM doesn't need.
 *
 * - changeReadingAge: text and tables only (no images/shapes/layout metadata)
 * - default: full slide content
 */
function getSlideContentForPrompt(
  editType: string,
  slides: SlideContent[],
): unknown[] {
  switch (editType) {
    case "changeReadingAge":
      return slides.map((slide) => ({
        slideNumber: slide.slideNumber,
        slideId: slide.slideId,
        slideTitle: slide.slideTitle,
        textElements: slide.textElements,
        tables: slide.tables,
      }));
    default:
      return slides;
  }
}

// ---------------------------------------------------------------------------
// Agent
// ---------------------------------------------------------------------------

function getInstructions(editType: string): string {
  const intentPrompt = PROMPTS[editType];
  if (!intentPrompt) {
    throw new Error(
      `No slides prompt registered for editType: "${editType}". ` +
        `Available: ${SUPPORTED_EDIT_TYPES.join(", ")}`,
    );
  }
  return intentPrompt + SHARED_RULES;
}

export async function generateSlidePlan(
  input: GenerateSlidePlanInput,
): Promise<SlidesAgentResponse | undefined> {
  try {
    console.log(
      "Generating slide plan for editType:",
      input.editType,
      `Input: ${input.userMessage}`,
    );
    const parsed = generateSlidePlanInputSchema.parse(input);
    const system = getInstructions(parsed.editType);
    const slidesForPrompt = getSlideContentForPrompt(
      parsed.editType,
      parsed.slides,
    );

    const { output } = await generateText({
      model: openai("gpt-4o-mini"),
      output: Output.object({ schema: slidesAgentResponseSchema }),
      system,
      prompt: `Edit type: ${parsed.editType}
User message: ${parsed.userMessage}

Slides:
${JSON.stringify(slidesForPrompt, null, 2)}`,
    });

    console.log(
      "Generated slide plan successfully",
      JSON.stringify(output, null, 2),
    );

    return output;
  } catch (error) {
    console.error(
      "Error generating slide plan:",
      error instanceof Error ? error.message : String(error),
      { error },
    );
    throw error;
  }
}

export type { SlidesAgentResponse };
