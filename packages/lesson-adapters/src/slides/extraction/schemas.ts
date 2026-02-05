import { z } from "zod";

/**
 * Zod schemas for slide content types.
 * These can be used for validation and type inference in TRPC endpoints.
 */

export const nonTextElementTypeSchema = z.enum([
  "shape",
  "image",
  "video",
  "table",
  "line",
  "diagram",
  "unknown",
]);

export const slideTextElementSchema = z.object({
  id: z.string(),
  content: z.string(),
  placeholderType: z.string().optional(),
  placeholderIndex: z.number().optional(),
  layoutObjectId: z.string().optional(),
});

export const slideTableCellSchema = z.object({
  id: z.string().describe("Composite ID: {tableId}_r{row}c{col}"),
  content: z.string(),
  row: z.number(),
  col: z.number(),
});

export const slideTableSchema = z.object({
  id: z.string(),
  rows: z.number(),
  columns: z.number(),
  cells: z.array(z.array(slideTableCellSchema)),
});

export const slideNonTextElementSchema = z.object({
  id: z.string(),
  type: nonTextElementTypeSchema,
  description: z.string(),
});

export const slideContentSchema = z.object({
  slideNumber: z.number(),
  slideId: z.string(),
  slideTitle: z.string().optional(),
  layoutName: z.string().optional(),
  textElements: z.array(slideTextElementSchema),
  tables: z.array(slideTableSchema),
  nonTextElements: z.array(slideNonTextElementSchema),
  keyLearningPoints: z
    .array(z.string())
    .optional()
    .describe("Key learning points covered on this slide"),
  learningCycles: z
    .array(z.string())
    .optional()
    .describe("Learning cycles covered on this slide"),
  coversDiversity: z
    .boolean()
    .optional()
    .describe("Whether the slide covers diversity topics"),
});

export const slideDeckContentSchema = z.object({
  slideDeckId: z.string(),
  lessonTitle: z.string(),
  slides: z.array(slideContentSchema),
});

export const parsedCellIdSchema = z.object({
  tableId: z.string(),
  row: z.number(),
  col: z.number(),
});
