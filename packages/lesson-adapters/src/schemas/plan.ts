import { z } from "zod";

/**
 * Schema for a single text edit within a slide.
 * changeId format: "te-{slideNumber}-{index}"
 */
export const textEditSchema = z.object({
  changeId: z.string(),
  slideNumber: z.number(),
  slideId: z.string(),
  elementId: z.string(),
  originalText: z.string(),
  newText: z.string(),
  reasoning: z.string(),
});

/**
 * Schema for a table cell edit.
 * Uses composite cellId format: {tableId}_r{row}c{col}
 */
export const tableCellEditSchema = z.object({
  changeId: z.string(),
  slideNumber: z.number(),
  slideId: z.string(),
  cellId: z.string(),
  originalText: z.string(),
  newText: z.string(),
  reasoning: z.string(),
});

/**
 * Schema for deleting a text element from a slide.
 */
export const textElementDeletionSchema = z.object({
  changeId: z.string(),
  slideNumber: z.number(),
  slideId: z.string(),
  elementId: z.string(),
  originalText: z.string(),
  reasoning: z.string(),
});

/**
 * Schema for deleting an entire slide.
 */
export const slideDeletionSchema = z.object({
  changeId: z.string(),
  slideNumber: z.number(),
  slideId: z.string(),
  reasoning: z.string(),
});

/**
 * Schema for the slides agent structured response.
 */
export const slidesAgentResponseSchema = z.object({
  analysis: z.string(),
  changes: z.object({
    textEdits: z.array(textEditSchema),
    tableCellEdits: z.array(tableCellEditSchema),
    textElementDeletions: z.array(textElementDeletionSchema),
    slideDeletions: z.array(slideDeletionSchema),
    slidesToKeep: z.array(
      z.object({
        slideNumber: z.number(),
        slideId: z.string(),
      }),
    ),
  }),
  reasoning: z.string(),
});

/**
 * Schema for the full adaptation plan returned by the coordinator.
 */
export const adaptationPlanSchema = z.object({
  intent: z.enum([
    "changeReadingAge",
    "deleteSlide",
    "editSlideText",
    "removeKLP",
    "other",
  ]),
  scope: z.enum(["global", "structural", "targeted"]),
  userMessage: z.string(),
  classifierConfidence: z.number(),
  classifierReasoning: z.string(),
  slidesAgentResponse: slidesAgentResponseSchema,
  totalChanges: z.number(),
});

// Inferred TypeScript types
export type TextEdit = z.infer<typeof textEditSchema>;
export type TableCellEdit = z.infer<typeof tableCellEditSchema>;
export type TextElementDeletion = z.infer<typeof textElementDeletionSchema>;
export type SlideDeletion = z.infer<typeof slideDeletionSchema>;
export type SlidesAgentResponse = z.infer<typeof slidesAgentResponseSchema>;
export type AdaptationPlan = z.infer<typeof adaptationPlanSchema>;
