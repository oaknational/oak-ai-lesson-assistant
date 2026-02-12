import { z } from "zod";

import { intentSchema } from "../agents/classifierAgent";

// ---------------------------------------------------------------------------
// Base schemas (no per-change reasoning) - used for bulk intents
// ---------------------------------------------------------------------------

const textEditBaseSchema = z.object({
  slideNumber: z.number(),
  slideId: z.string(),
  elementId: z.string(),
  originalText: z.string(),
  newText: z.string(),
});

const tableCellEditBaseSchema = z.object({
  slideNumber: z.number(),
  slideId: z.string(),
  cellId: z.string(),
  originalText: z.string(),
  newText: z.string(),
});

const textElementDeletionBaseSchema = z.object({
  slideNumber: z.number(),
  slideId: z.string(),
  elementId: z.string(),
  originalText: z.string(),
});

const slideDeletionBaseSchema = z.object({
  slideNumber: z.number(),
  slideId: z.string(),
});

const slidesToKeepSchema = z.object({
  slideNumber: z.number(),
  slideId: z.string(),
});

// ---------------------------------------------------------------------------
// Bulk response schema (no per-change reasoning)
// ---------------------------------------------------------------------------

export const bulkChangesSchema = z.object({
  analysis: z.string(),
  changes: z.object({
    textEdits: z.array(textEditBaseSchema),
    tableCellEdits: z.array(tableCellEditBaseSchema),
    textElementDeletions: z.array(textElementDeletionBaseSchema),
    slideDeletions: z.array(slideDeletionBaseSchema),
    slidesToKeep: z.array(slidesToKeepSchema),
  }),
  reasoning: z.string(),
});

// ---------------------------------------------------------------------------
// Targeted response schema (with per-change reasoning)
// ---------------------------------------------------------------------------

export const targetedChangesSchema = z.object({
  analysis: z.string(),
  changes: z.object({
    textEdits: z.array(textEditBaseSchema.extend({ reasoning: z.string() })),
    tableCellEdits: z.array(
      tableCellEditBaseSchema.extend({ reasoning: z.string() }),
    ),
    textElementDeletions: z.array(
      textElementDeletionBaseSchema.extend({ reasoning: z.string() }),
    ),
    slideDeletions: z.array(
      slideDeletionBaseSchema.extend({ reasoning: z.string() }),
    ),
    slidesToKeep: z.array(slidesToKeepSchema),
  }),
  reasoning: z.string(),
});

// ---------------------------------------------------------------------------
// Normalized types (used throughout the app after LLM response)
// Per-change reasoning is optional - present for targeted, absent for bulk
// ---------------------------------------------------------------------------

export interface TextEdit {
  changeId: string;
  slideNumber: number;
  slideId: string;
  elementId: string;
  originalText: string;
  newText: string;
  reasoning?: string;
}

export interface TableCellEdit {
  changeId: string;
  slideNumber: number;
  slideId: string;
  cellId: string;
  originalText: string;
  newText: string;
  reasoning?: string;
}

export interface TextElementDeletion {
  changeId: string;
  slideNumber: number;
  slideId: string;
  elementId: string;
  originalText: string;
  reasoning?: string;
}

export interface SlideDeletion {
  changeId: string;
  slideNumber: number;
  slideId: string;
  reasoning?: string;
}

export interface SlidesAgentResponse {
  analysis: string;
  changes: {
    textEdits: TextEdit[];
    tableCellEdits: TableCellEdit[];
    textElementDeletions: TextElementDeletion[];
    slideDeletions: SlideDeletion[];
    slidesToKeep: { slideNumber: number; slideId: string }[];
  };
  reasoning: string;
}

/**
 * Adds changeIds to all changes in the response.
 * This removes the burden from the LLM and ensures consistent ID format.
 */
function addChangeIds(
  response:
    | z.infer<typeof bulkChangesSchema>
    | z.infer<typeof targetedChangesSchema>,
): SlidesAgentResponse {
  return {
    analysis: response.analysis,
    reasoning: response.reasoning,
    changes: {
      textEdits: response.changes.textEdits.map((edit, idx) => ({
        ...edit,
        changeId: `te-${edit.slideNumber}-${idx + 1}`,
      })),
      tableCellEdits: response.changes.tableCellEdits.map((edit, idx) => ({
        ...edit,
        changeId: `tce-${edit.slideNumber}-${idx + 1}`,
      })),
      textElementDeletions: response.changes.textElementDeletions.map(
        (deletion, idx) => ({
          ...deletion,
          changeId: `ted-${deletion.slideNumber}-${idx + 1}`,
        }),
      ),
      slideDeletions: response.changes.slideDeletions.map((deletion, idx) => ({
        ...deletion,
        changeId: `sd-${deletion.slideNumber}-${idx + 1}`,
      })),
      slidesToKeep: response.changes.slidesToKeep,
    },
  };
}

/**
 * Normalizes a bulk or targeted LLM response to the standard SlidesAgentResponse type.
 * This ensures downstream code always works with optional reasoning fields and
 * auto-generates changeIds (not produced by LLM due to structured output constraints).
 */
export function normalizeAgentResponse(
  response:
    | z.infer<typeof bulkChangesSchema>
    | z.infer<typeof targetedChangesSchema>,
): SlidesAgentResponse {
  // Transform LLM response to include changeIds
  // Bulk responses have no reasoning on changes (will be undefined)
  // Targeted responses have reasoning on changes (will be present)
  return addChangeIds(response);
}

// ---------------------------------------------------------------------------
// Adaptation plan schema (uses normalized response type)
// ---------------------------------------------------------------------------

export const adaptationPlanSchema = z.object({
  intent: intentSchema.shape.intent,
  scope: z.enum(["global", "structural", "targeted"]),
  userMessage: z.string(),
  classifierConfidence: z.number(),
  classifierReasoning: z.string(),
  slidesAgentResponse: z.custom<SlidesAgentResponse>(),
  totalChanges: z.number(),
});

export type AdaptationPlan = z.infer<typeof adaptationPlanSchema>;
